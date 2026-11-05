import type {
  DashboardSummary,
  Ticket,
  TicketStatus
} from "./types.js";

export function getDashboardSummary(
  tickets: Ticket[],
  now = new Date()
): DashboardSummary {
  const byStatus: Record<TicketStatus, number> = {
    New: 0,
    "In Progress": 0,
    Pending: 0,
    Resolved: 0,
    Closed: 0
  };

  for (const ticket of tickets) {
    byStatus[ticket.status] += 1;
  }

  const dueLimit =
    now.getTime() +
    48 * 60 * 60 * 1000;

  const isOpen = (ticket: Ticket) =>
    ticket.status !== "Resolved" &&
    ticket.status !== "Closed";

  return {
    total: tickets.length,

    open: tickets.filter(isOpen).length,

    critical: tickets.filter(
      (ticket) =>
        ticket.priority.startsWith("P1") &&
        isOpen(ticket)
    ).length,

    dueSoon: tickets.filter(
      (ticket) =>
        isOpen(ticket) &&
        new Date(ticket.dueAt).getTime() <= dueLimit
    ).length,

    resolved: byStatus.Resolved,

    byStatus
  };
}