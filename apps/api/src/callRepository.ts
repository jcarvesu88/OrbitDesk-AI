import {
  type CallConversionResult,
  type CallConvertInput,
  type CallRecord,
  type EmailIntakeCreate
} from "@orbitdesk/shared";

import {
  TicketRepository
} from "./repository.js";

export class CallRepository {
  private readonly calls =
    new Map<string, CallRecord>();

  /*
   * Return all CALL records.
   * Newest records appear first.
   */
  list(): CallRecord[] {
    return [
      ...this.calls.values()
    ]
      .map((call) =>
        structuredClone(call)
      )
      .sort((a, b) =>
        b.updatedAt.localeCompare(
          a.updatedAt
        )
      );
  }

  /*
   * Return a single CALL record.
   */
  get(
    id: string
  ): CallRecord | undefined {
    const call =
      this.calls.get(
        id.toUpperCase()
      );

    return call
      ? structuredClone(call)
      : undefined;
  }

  /*
   * Synthetic email intake.
   *
   * Example:
   * incoming email
   *      ↓
   * CALL1001
   */
  createFromEmail(
    input: EmailIntakeCreate,
    now = new Date()
  ): CallRecord {
    const id =
      this.nextCallId();

    const timestamp =
      now.toISOString();

    const call: CallRecord = {
      id,

      source: "Email",

      subject:
        input.subject,

      description:
        input.description,

      requester:
        input.requester,

      requesterEmail:
        input.requesterEmail,

      priority:
        input.priority,

      category:
        input.category,

      assignmentGroup:
  "Unassigned",

      location:
        input.location,

      asset:
        input.asset,

      status: "New",

      createdAt:
        timestamp,

      updatedAt:
        timestamp
    };

    this.calls.set(
      id.toUpperCase(),
      call
    );

    return structuredClone(
      call
    );
  }

  /*
   * Convert an existing CALL record
   * into an OrbitDesk incident.
   *
   * CALL1001
   *      ↓
   * INCxxxx
   *
   * The selected Assignment Group
   * receives the new ticket.
   *
   * No engineer is assigned yet.
   */
  convertToTicket(
    id: string,
    input: CallConvertInput,
    ticketRepository: TicketRepository,
    now = new Date()
  ): CallConversionResult | undefined {
    const key =
      id.toUpperCase();

    const current =
      this.calls.get(key);

    if (!current) {
      return undefined;
    }

    /*
     * A CALL cannot be converted twice.
     */
    if (
      current.status === "Converted" ||
      current.convertedTicketId
    ) {
      throw new Error(
        "This call has already been converted to an incident."
      );
    }

    const assignmentGroup =
      input.assignmentGroup.trim();

    if (!assignmentGroup) {
      throw new Error(
        "Assignment group is required before converting the call."
      );
    }

    /*
     * TicketRepository remains responsible
     * for:
     *
     * - INCxxxx generation
     * - Status = New
     * - createdAt / updatedAt
     * - dueAt
     * - initial activity
     */
    const ticket =
      ticketRepository.create(
        {
          shortDescription:
            current.subject,

          description:
            current.description,

          priority:
            current.priority,

          category:
            current.category,

          assignmentGroup,

          /*
           * Important:
           * The incident is already routed
           * to a team, but not yet owned
           * by a specific engineer.
           */
          assignee:
            "Unassigned",

          requester:
            current.requester,

          requesterEmail:
            current.requesterEmail,

          location:
            current.location,

          asset:
            current.asset,

          tags: [
            "email-intake",
            "call-conversion"
          ]
        },
        now
      );

    const convertedAt =
      now.toISOString();

    const convertedCall: CallRecord = {
      ...current,

      assignmentGroup,

      status: "Converted",

      updatedAt:
        convertedAt,

      convertedAt,

      convertedTicketId:
        ticket.id
    };

    this.calls.set(
      key,
      convertedCall
    );

    return {
      call:
        structuredClone(
          convertedCall
        ),

      ticket:
        structuredClone(
          ticket
        )
    };
  }

  /*
   * Generate:
   *
   * CALL1001
   * CALL1002
   * CALL1003
   *
   * CALL numbers are independent
   * from INC numbers.
   */
  private nextCallId(): string {
    const highestNumber = [
      ...this.calls.keys()
    ].reduce(
      (
        highest,
        id
      ) => {
        const match =
          /^CALL(\d+)$/i.exec(
            id
          );

        if (!match) {
          return highest;
        }

        const value =
          Number(
            match[1]
          );

        if (
          !Number.isFinite(
            value
          )
        ) {
          return highest;
        }

        return Math.max(
          highest,
          value
        );
      },
      1000
    );

    return `CALL${
      highestNumber + 1
    }`;
  }
}