import type {
  IncomingMessage,
  ServerResponse
} from "node:http";

import {
  answerWithMockAi,
  getDashboardSummary,
  knowledgeArticles,
  searchKnowledge,
  ticketPriorities,
  ticketStatuses,
  type CallConvertInput,
  type EmailIntakeCreate,
  type TicketCreate,
  type TicketUpdate
} from "@orbitdesk/shared";

import {
  TicketRepository
} from "./repository.js";
import {
  CallRepository
} from "./callRepository.js";

type JsonRecord = Record<string, unknown>;

function sendJson(
  res: ServerResponse,
  status: number,
  value: unknown
) {
  const body = JSON.stringify(value);

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
    "X-Content-Type-Options": "nosniff"
  });

  res.end(body);
}

async function readJson(
  req: IncomingMessage
): Promise<JsonRecord> {
  const chunks: Buffer[] = [];
  let bytes = 0;

  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);

    bytes += buffer.length;

    if (bytes > 131072) {
      throw new Error("Payload too large");
    }

    chunks.push(buffer);
  }

  const raw =
    Buffer.concat(chunks).toString("utf8") || "{}";

  const parsed: unknown = JSON.parse(raw);

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error("JSON object required");
  }

  return parsed as JsonRecord;
}

function requiredString(
  value: unknown,
  min: number,
  max: number
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= min &&
    value.trim().length <= max
  );
}

function isSyntheticRequesterEmail(
  value: unknown
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^[^@\s]+@example\.invalid$/i.test(
    value.trim()
  );
}

function parseTags(
  value: unknown
): string[] | null {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const tags: string[] = [];

  for (const item of value) {
    if (
      typeof item !== "string" ||
      item.trim().length < 1 ||
      item.trim().length > 40
    ) {
      return null;
    }

    const normalized =
      item.trim().toLowerCase();

    if (!tags.includes(normalized)) {
      tags.push(normalized);
    }
  }

  return tags.slice(0, 12);
}

function parseTicketCreate(
  body: JsonRecord
): TicketCreate | null {
  const allowedKeys = [
    "shortDescription",
    "description",
    "priority",
    "category",
    "assignmentGroup",
    "assignee",
    "requester",
    "requesterEmail",
    "location",
    "asset",
    "tags"
  ];

  if (
    Object.keys(body).some(
      (key) =>
        !allowedKeys.includes(key)
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.shortDescription,
      3,
      160
    ) ||
    !requiredString(
      body.description,
      3,
      5000
    )
  ) {
    return null;
  }

  if (
    !ticketPriorities.includes(
      body.priority as
        (typeof ticketPriorities)[number]
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.category,
      2,
      80
    ) ||
    !requiredString(
      body.assignmentGroup,
      2,
      80
    ) ||
    !requiredString(
      body.assignee,
      2,
      80
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.requester,
      2,
      100
    ) ||
    !isSyntheticRequesterEmail(
      body.requesterEmail
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.location,
      2,
      120
    ) ||
    !requiredString(
      body.asset,
      2,
      80
    )
  ) {
    return null;
  }

  const tags =
    parseTags(body.tags);

  if (tags === null) {
    return null;
  }

  return {
    shortDescription:
      body.shortDescription.trim(),

    description:
      body.description.trim(),

    priority:
      body.priority as
        TicketCreate["priority"],

    category:
      body.category.trim(),

    assignmentGroup:
      body.assignmentGroup.trim(),

    assignee:
      body.assignee.trim(),

    requester:
      body.requester.trim(),

    requesterEmail:
      body.requesterEmail
        .trim()
        .toLowerCase(),

    location:
      body.location.trim(),

    asset:
      body.asset.trim(),

    tags
  };
}

function parseTicketUpdate(
  body: JsonRecord
): TicketUpdate | null {
  const allowedKeys = [
    "shortDescription",
    "description",
    "status",
    "priority",
    "category",
    "assignmentGroup",
    "assignee"
  ];

  if (
    Object.keys(body).some(
      (key) => !allowedKeys.includes(key)
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.shortDescription,
      3,
      160
    ) ||
    !requiredString(
      body.description,
      3,
      5000
    )
  ) {
    return null;
  }

  if (
    !ticketStatuses.includes(
      body.status as
        (typeof ticketStatuses)[number]
    )
  ) {
    return null;
  }

  /*
   * Closed is system-controlled.
   * Engineers cannot manually move a ticket to Closed.
   */
  if (body.status === "Closed") {
    return null;
  }

  if (
    !ticketPriorities.includes(
      body.priority as
        (typeof ticketPriorities)[number]
    )
  ) {
    return null;
  }

  if (
    !requiredString(body.category, 2, 80) ||
    !requiredString(
      body.assignmentGroup,
      2,
      80
    ) ||
    !requiredString(body.assignee, 2, 80)
  ) {
    return null;
  }

  return {
    shortDescription:
      body.shortDescription.trim(),

    description:
      body.description.trim(),

    status:
      body.status as TicketUpdate["status"],

    priority:
      body.priority as TicketUpdate["priority"],

    category:
      body.category.trim(),

    assignmentGroup:
      body.assignmentGroup.trim(),

    assignee:
      body.assignee.trim()
  };
}
function parseEmailIntake(
  body: JsonRecord
): EmailIntakeCreate | null {
  const allowedKeys = [
    "subject",
    "description",
    "requester",
    "requesterEmail",
    "priority",
    "category",
    "location",
    "asset"
  ];

  if (
    Object.keys(body).some(
      (key) =>
        !allowedKeys.includes(key)
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.subject,
      3,
      160
    ) ||
    !requiredString(
      body.description,
      3,
      5000
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.requester,
      2,
      100
    ) ||
    !isSyntheticRequesterEmail(
      body.requesterEmail
    )
  ) {
    return null;
  }

  if (
    !ticketPriorities.includes(
      body.priority as
        (typeof ticketPriorities)[number]
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.category,
      2,
      80
    ) ||
    !requiredString(
      body.location,
      2,
      120
    ) ||
    !requiredString(
      body.asset,
      2,
      80
    )
  ) {
    return null;
  }

  return {
    subject:
      body.subject.trim(),

    description:
      body.description.trim(),

    requester:
      body.requester.trim(),

    requesterEmail:
      body.requesterEmail
        .trim()
        .toLowerCase(),

    priority:
      body.priority as
        EmailIntakeCreate["priority"],

    category:
      body.category.trim(),

    location:
      body.location.trim(),

    asset:
      body.asset.trim()
  };
}

function parseCallConversion(
  body: JsonRecord
): CallConvertInput | null {
  const allowedKeys = [
    "assignmentGroup"
  ];

  if (
    Object.keys(body).some(
      (key) =>
        !allowedKeys.includes(key)
    )
  ) {
    return null;
  }

  if (
    !requiredString(
      body.assignmentGroup,
      2,
      80
    )
  ) {
    return null;
  }

  return {
    assignmentGroup:
      body.assignmentGroup.trim()
  };
}
export function createRequestHandler(
  repository = new TicketRepository(),
  callRepository = new CallRepository()
) {
  return async (
    req: IncomingMessage,
    res: ServerResponse
  ) => {
    try {
      if (req.method === "OPTIONS") {
        return sendJson(
          res,
          204,
          null
        );
      }

      const url = new URL(
        req.url ?? "/",
        "http://localhost"
      );

      const path =
        decodeURIComponent(url.pathname);

      /*
       * Health
       */
      if (
        req.method === "GET" &&
        path === "/health"
      ) {
        return sendJson(res, 200, {
          status: "ok",
          service: "orbitdesk-api",
          mode: "synthetic-prototype"
        });
      }

      /*
       * Dashboard
       */
      if (
        req.method === "GET" &&
        path === "/api/dashboard"
      ) {
        return sendJson(
          res,
          200,
          getDashboardSummary(
            repository.list()
          )
        );
      }

      /*
       * List tickets
       */
      if (
        req.method === "GET" &&
        path === "/api/tickets"
      ) {
        return sendJson(
          res,
          200,
          repository.list()
        );
      } /*
 * List CALL records
 */
if (
  req.method === "GET" &&
  path === "/api/calls"
) {
  return sendJson(
    res,
    200,
    callRepository.list()
  );
}

/*
 * Synthetic email intake
 *
 * Email -> CALLxxxx
 */
if (
  req.method === "POST" &&
  path === "/api/intake/email"
) {
  const body =
    await readJson(req);

  const input =
    parseEmailIntake(body);

  if (!input) {
    return sendJson(
      res,
      400,
      {
        error:
          "Validation failed. Complete all email intake fields and use an @example.invalid requester email."
      }
    );
  }

  const call =
    callRepository.createFromEmail(
      input
    );

  return sendJson(
    res,
    201,
    call
  );
}


      /*
       * CREATE TICKET
       */
      if (
        req.method === "POST" &&
        path === "/api/tickets"
      ) {
        const body =
          await readJson(req);

        const input =
          parseTicketCreate(body);

        if (!input) {
          return sendJson(
            res,
            400,
            {
              error:
                "Validation failed. Use synthetic ticket data and an @example.invalid requester email."
            }
          );
        }

        const ticket =
          repository.create(input);

        return sendJson(
          res,
          201,
          ticket
        );
      }

      /*
       * Knowledge
       */
      if (
        req.method === "GET" &&
        path === "/api/knowledge"
      ) {
        return sendJson(
          res,
          200,
          knowledgeArticles
        );
      }

      if (
        req.method === "GET" &&
        path === "/api/knowledge/search"
      ) {
        return sendJson(
          res,
          200,
          searchKnowledge(
            url.searchParams.get("q") ?? "",
            5
          )
        );
      }
/*
 * Convert CALL to incident
 *
 * CALL1001
 *   ->
 * INCxxxx
 */
const callConvertMatch =
  path.match(
    /^\/api\/calls\/([^/]+)\/convert$/
  );

if (
  callConvertMatch &&
  req.method === "POST"
) {
  const body =
    await readJson(req);

  const input =
    parseCallConversion(body);

  if (!input) {
    return sendJson(
      res,
      400,
      {
        error:
          "A valid assignment group is required."
      }
    );
  }

  try {
    const result =
      callRepository.convertToTicket(
        callConvertMatch[1],
        input,
        repository
      );

    return result
      ? sendJson(
          res,
          201,
          result
        )
      : sendJson(
          res,
          404,
          {
            error:
              "Call not found"
          }
        );
  } catch (error) {
    return sendJson(
      res,
      409,
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to convert call"
      }
    );
  }
}

/*
 * Get individual CALL
 */
const callMatch =
  path.match(
    /^\/api\/calls\/([^/]+)$/
  );

if (
  callMatch &&
  req.method === "GET"
) {
  const call =
    callRepository.get(
      callMatch[1]
    );

  return call
    ? sendJson(
        res,
        200,
        call
      )
    : sendJson(
        res,
        404,
        {
          error:
            "Call not found"
        }
      );
}
      /*
       * Individual ticket
       */
      const ticketMatch =
        path.match(
          /^\/api\/tickets\/([^/]+)$/
        );

      /*
       * Get ticket
       */
      if (
        ticketMatch &&
        req.method === "GET"
      ) {
        const ticket =
          repository.get(
            ticketMatch[1]
          );

        return ticket
          ? sendJson(
              res,
              200,
              ticket
            )
          : sendJson(
              res,
              404,
              {
                error: "Ticket not found"
              }
            );
      }

      /*
       * Update ticket
       */
      if (
        ticketMatch &&
        req.method === "PUT"
      ) {
        const body =
          await readJson(req);

        const update =
          parseTicketUpdate(body);

        if (!update) {
          return sendJson(
            res,
            400,
            {
              error:
                "Validation failed. Closed is an automated final status and cannot be selected manually."
            }
          );
        }

        try {
          const ticket =
            repository.update(
              ticketMatch[1],
              update
            );

          return ticket
            ? sendJson(
                res,
                200,
                ticket
              )
            : sendJson(
                res,
                404,
                {
                  error:
                    "Ticket not found"
                }
              );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Ticket update failed";

          if (
            message.includes(
              "Closed tickets"
            )
          ) {
            return sendJson(
              res,
              409,
              {
                error: message
              }
            );
          }

          throw error;
        }
      }

      /*
       * Mock AI assistant
       */
      if (
        req.method === "POST" &&
        path === "/api/ai/ask"
      ) {
        const body =
          await readJson(req);

        if (
          !requiredString(
            body.question,
            3,
            1000
          ) ||
          (
            body.ticketId !== undefined &&
            !requiredString(
              body.ticketId,
              1,
              40
            )
          )
        ) {
          return sendJson(
            res,
            400,
            {
              error:
                "Validation failed"
            }
          );
        }

        const ticket =
          typeof body.ticketId === "string"
            ? repository.get(
                body.ticketId
              )
            : undefined;

        return sendJson(
          res,
          200,
          answerWithMockAi(
            body.question.trim(),
            ticket
          )
        );
      }

      return sendJson(
        res,
        404,
        {
          error: "Route not found"
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid request";

      return sendJson(
        res,
        message === "Payload too large"
          ? 413
          : 400,
        {
          error: message
        }
      );
    }
  };
}