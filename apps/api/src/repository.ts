import {
  syntheticTickets,
  type Ticket,
  type TicketCreate,
  type TicketUpdate
} from "@orbitdesk/shared";

const THREE_DAYS_MS =
  3 * 24 * 60 * 60 * 1000;

const priorityDueHours: Record<
  Ticket["priority"],
  number
> = {
  "P1 - Critical": 4,
  "P2 - High": 24,
  "P3 - Moderate": 72,
  "P4 - Low": 120
};

export class TicketRepository {
  private readonly tickets =
    new Map<string, Ticket>();

  constructor(
    seed: Ticket[] = syntheticTickets
  ) {
    seed.forEach((ticket) => {
      this.tickets.set(
        ticket.id.toUpperCase(),
        structuredClone(ticket)
      );
    });
  }

  /*
   * Evaluate all resolved tickets whenever the
   * repository is read or changed.
   *
   * A resolved ticket becomes permanently Closed when:
   * - resolvedAt is at least three days old; and
   * - no customer response was recorded after resolvedAt.
   */
  private applyAutoClose(
    now = new Date()
  ): void {
    for (const [
      key,
      current
    ] of this.tickets.entries()) {
      if (
        current.status !== "Resolved" ||
        !current.resolvedAt
      ) {
        continue;
      }

      const resolvedAt =
        new Date(
          current.resolvedAt
        ).getTime();

      if (
        Number.isNaN(resolvedAt) ||
        now.getTime() - resolvedAt <
          THREE_DAYS_MS
      ) {
        continue;
      }

      const customerRespondedAfterResolution =
        current.lastCustomerResponseAt !==
          undefined &&
        new Date(
          current.lastCustomerResponseAt
        ).getTime() > resolvedAt;

      if (
        customerRespondedAfterResolution
      ) {
        continue;
      }

      const closedAt =
        now.toISOString();

      const closed: Ticket = {
        ...current,

        status: "Closed",
        updatedAt: closedAt,
        closedAt,

        closeReason:
          "Auto-closed after 3 days without customer response.",

        activity: [
          ...current.activity,
          {
            id:
              `activity-${current.id}-${now.getTime()}`,

            author:
              "OrbitDesk Automation",

            at: closedAt,

            body:
              "Ticket automatically closed after three days without a customer response.",

            kind: "system"
          }
        ]
      };

      this.tickets.set(
        key,
        closed
      );
    }
  }

  list(): Ticket[] {
    this.applyAutoClose();

    return [
      ...this.tickets.values()
    ]
      .map((ticket) =>
        structuredClone(ticket)
      )
      .sort((a, b) =>
        b.updatedAt.localeCompare(
          a.updatedAt
        )
      );
  }

  get(
    id: string
  ): Ticket | undefined {
    this.applyAutoClose();

    const ticket =
      this.tickets.get(
        id.toUpperCase()
      );

    return ticket
      ? structuredClone(ticket)
      : undefined;
  }

  create(
    input: TicketCreate,
    now = new Date()
  ): Ticket {
    this.applyAutoClose(now);

    const id =
      this.nextTicketId();

    const timestamp =
      now.toISOString();

    const dueHours =
      priorityDueHours[
        input.priority
      ];

    const dueAt =
      new Date(
        now.getTime() +
          dueHours *
            60 *
            60 *
            1000
      ).toISOString();

    const ticket: Ticket = {
      id,

      shortDescription:
        input.shortDescription,

      description:
        input.description,

      status: "New",

      priority:
        input.priority,

      category:
        input.category,

      assignmentGroup:
        input.assignmentGroup,

      assignee:
        input.assignee,

      requester:
        input.requester,

      requesterEmail:
        input.requesterEmail,

      location:
        input.location,

      asset:
        input.asset,

      createdAt:
        timestamp,

      updatedAt:
        timestamp,

      dueAt,

      tags:
        input.tags ?? [],

      activity: [
        {
          id:
            `activity-${id}-${now.getTime()}`,

          author:
            "OrbitDesk System",

          at:
            timestamp,

          body:
            "Synthetic ticket created.",

          kind:
            "system"
        }
      ]
    };

    this.tickets.set(
      id,
      ticket
    );

    return structuredClone(
      ticket
    );
  }

  update(
    id: string,
    update: TicketUpdate,
    now = new Date()
  ): Ticket | undefined {
    this.applyAutoClose(now);

    const key =
      id.toUpperCase();

    const current =
      this.tickets.get(key);

    if (!current) {
      return undefined;
    }

    /*
     * Closed is a permanent final state.
     * No edits or reopening are allowed.
     */
    if (
      current.status === "Closed"
    ) {
      throw new Error(
        "Closed tickets cannot be reopened or modified."
      );
    }

    const updatedAt =
      now.toISOString();

    const enteringResolved =
      current.status !==
        "Resolved" &&
      update.status ===
        "Resolved";

    const leavingResolved =
      current.status ===
        "Resolved" &&
      update.status !==
        "Resolved";

    const next: Ticket = {
      ...current,
      ...update,

      id: current.id,

      updatedAt,

      resolvedAt:
        enteringResolved
          ? updatedAt
          : leavingResolved
            ? undefined
            : current.resolvedAt,

      closedAt:
        undefined,

      closeReason:
        undefined
    };

    if (enteringResolved) {
      next.activity = [
        ...current.activity,
        {
          id:
            `activity-${current.id}-${now.getTime()}`,

          author:
            "OrbitDesk System",

          at:
            updatedAt,

          body:
            "Ticket moved to Resolved. The ticket will automatically close after three days without a customer response.",

          kind:
            "system"
        }
      ];
    }

    this.tickets.set(
      key,
      next
    );

    return structuredClone(
      next
    );
  }

  private nextTicketId(): string {
    const highestNumber = [
      ...this.tickets.keys()
    ].reduce(
      (highest, id) => {
        const match =
          /^INC-?(\d+)$/i.exec(id);

        if (!match) {
          return highest;
        }

        const value =
          Number(match[1]);

        return Number.isFinite(value)
          ? Math.max(
              highest,
              value
            )
          : highest;
      },
      1000
    );

    return `INC${highestNumber + 1}`;
  }
}