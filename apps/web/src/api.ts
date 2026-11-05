import type {
  AiAnswer,
  CallConversionResult,
  CallRecord,
  DashboardSummary,
  KnowledgeArticle,
  Ticket,
  TicketCreate,
  TicketUpdate
} from "@orbitdesk/shared";

const API_URL =
  (
    import.meta.env.VITE_API_URL as
      | string
      | undefined
  )?.replace(/\/$/, "") ?? "";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      },
      ...options
    }
  );

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({
        error: "Request failed"
      })) as {
        error?: string;
      };

    throw new Error(
      payload.error ??
        `Request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboard: () =>
    request<DashboardSummary>(
      "/api/dashboard"
    ),

  getTickets: () =>
    request<Ticket[]>(
      "/api/tickets"
    ),

  getTicket: (id: string) =>
    request<Ticket>(
      `/api/tickets/${encodeURIComponent(id)}`
    ),

  createTicket: (
    ticket: TicketCreate
  ) =>
    request<Ticket>(
      "/api/tickets",
      {
        method: "POST",
        body: JSON.stringify(ticket)
      }
    ),

  updateTicket: (
    id: string,
    update: TicketUpdate
  ) =>
    request<Ticket>(
      `/api/tickets/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(update)
      }
    ),

  getCalls: () =>
    request<CallRecord[]>(
      "/api/calls"
    ),

  getCall: (id: string) =>
    request<CallRecord>(
      `/api/calls/${encodeURIComponent(id)}`
    ),

  convertCall: (
    id: string,
    assignmentGroup: string
  ) =>
    request<CallConversionResult>(
      `/api/calls/${encodeURIComponent(id)}/convert`,
      {
        method: "POST",
        body: JSON.stringify({
          assignmentGroup
        })
      }
    ),

  getKnowledge: () =>
    request<KnowledgeArticle[]>(
      "/api/knowledge"
    ),

  askAi: (
    question: string,
    ticketId?: string
  ) =>
    request<AiAnswer>(
      "/api/ai/ask",
      {
        method: "POST",
        body: JSON.stringify({
          question,
          ticketId:
            ticketId || undefined
        })
      }
    )
};