export const ticketStatuses = [
  "New",
  "In Progress",
  "Pending",
  "Resolved",
  "Closed"
] as const;

export const ticketPriorities = [
  "P1 - Critical",
  "P2 - High",
  "P3 - Moderate",
  "P4 - Low"
] as const;

export type TicketStatus =
  (typeof ticketStatuses)[number];

export type TicketPriority =
  (typeof ticketPriorities)[number];

export type TicketActivityKind =
  | "customer"
  | "agent"
  | "system";

export interface TicketActivity {
  id: string;
  author: string;
  at: string;
  body: string;

  /*
   * Optional for compatibility with existing synthetic data.
   * New activities should identify their source.
   */
  kind?: TicketActivityKind;
}

export interface Ticket {
  id: string;

  shortDescription: string;
  description: string;

  status: TicketStatus;
  priority: TicketPriority;

  category: string;

  assignmentGroup: string;
  assignee: string;

  requester: string;
  requesterEmail: string;

  location: string;
  asset: string;

  createdAt: string;
  updatedAt: string;
  dueAt: string;

  /*
   * Lifecycle timestamps.
   *
   * resolvedAt:
   * Set by the API when the ticket first enters Resolved.
   *
   * closedAt:
   * Set by the API after the three-day no-response window.
   *
   * closeReason:
   * Explains why the record became Closed.
   */
  resolvedAt?: string;
  closedAt?: string;
  closeReason?: string;

  /*
   * Used to determine whether the customer responded
   * during the three-day resolution confirmation window.
   */
  lastCustomerResponseAt?: string;

  tags: string[];

  activity: TicketActivity[];
}

/*
 * Fields an engineer can change on an existing ticket.
 *
 * The API remains responsible for:
 * - updatedAt
 * - resolvedAt
 * - closedAt
 * - closeReason
 * - final-state enforcement
 */
export type TicketUpdate = Pick<
  Ticket,
  | "shortDescription"
  | "description"
  | "status"
  | "priority"
  | "category"
  | "assignmentGroup"
  | "assignee"
>;

/*
 * Fields supplied when creating a new synthetic ticket.
 *
 * The API will generate:
 * - id
 * - status = New
 * - createdAt
 * - updatedAt
 * - dueAt
 * - lifecycle timestamps
 * - initial system activity
 *
 * A caller cannot create a ticket directly as
 * Resolved or Closed.
 */
export type TicketCreate = Pick<
  Ticket,
  | "shortDescription"
  | "description"
  | "priority"
  | "category"
  | "assignmentGroup"
  | "assignee"
  | "requester"
  | "requesterEmail"
  | "location"
  | "asset"
> & {
  tags?: string[];
};

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface DashboardSummary {
  total: number;
  open: number;
  critical: number;
  dueSoon: number;
  resolved: number;

  /*
   * Includes:
   * New, In Progress, Pending, Resolved, and Closed.
   */
  byStatus: Record<
    TicketStatus,
    number
  >;
}

export interface AiAnswer {
  answer: string;

  citations: Array<
    Pick<
      KnowledgeArticle,
      "id" | "title" | "summary"
    >
  >;

  suggestedActions: string[];

  disclaimer: string;
}
/*
 * OrbitDesk Call / Email Intake workflow
 *
 * Synthetic email
 *   -> CALLxxxx
 *   -> Assignment Group
 *   -> Convert to INCxxxx
 *   -> Assigned To = Unassigned
 */

export const callStatuses = [
  "New",
  "Converted"
] as const;

export type CallStatus =
  (typeof callStatuses)[number];

export interface CallRecord {
  id: string;

  source: "Email";

  subject: string;
  description: string;

  requester: string;
  requesterEmail: string;

  priority: TicketPriority;

  category: string;

  /*
   * Team queue where the call should land
   * when converted to an incident.
   */
  assignmentGroup: string;

  location: string;
  asset: string;

  status: CallStatus;

  createdAt: string;
  updatedAt: string;

  /*
   * Populated after conversion.
   */
  convertedTicketId?: string;
  convertedAt?: string;
}

export interface EmailIntakeCreate {
  subject: string;
  description: string;

  requester: string;
  requesterEmail: string;

  priority: TicketPriority;

  category: string;

 

  location: string;
  asset: string;
}

export interface CallConvertInput {
  /*
   * Final team queue selected before conversion.
   */
  assignmentGroup: string;
}

export interface CallConversionResult {
  call: CallRecord;
  ticket: Ticket;
}