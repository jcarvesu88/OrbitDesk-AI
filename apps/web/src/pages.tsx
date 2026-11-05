import { ArrowLeft, ArrowRight, Bot, CheckCircle2, ExternalLink, RefreshCw, Save, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ticketPriorities,
  ticketStatuses,
  type AiAnswer,
  type CallRecord,
  type DashboardSummary,
  type KnowledgeArticle,
  type Ticket,
  type TicketCreate,
  type TicketUpdate
} from "@orbitdesk/shared";
import { api } from './api';
import { PageHeader, PriorityPill, StatusPill, TicketTable } from './components';
import { useTheme } from './theme';

function useRemote<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; setLoading(true); loader().then((value) => { if (active) { setData(value); setError(''); } }).catch((reason: Error) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, deps);
  return { data, error, loading, setData };
}

function Loading() { return <div className="loading"><RefreshCw className="spin" size={22}/>Loading workspace…</div>; }
function ErrorState({ message }: { message: string }) { return <div className="notice error"><b>Unable to load data.</b> {message}. Confirm the API is running on port 8787.</div>; }

const dashboardTeams = [
  "Service Desk",
  "CSP Support (L1)",
  "Identity Operations",
  "Network Operations",
  "Digital Workplace"
] as const;

export function DashboardPage() {
  const ticketsState = useRemote(
    api.getTickets,
    []
  );

  const [params, setParams] =
    useSearchParams();

  const selectedTeam =
    params.get("team") ??
    "Service Desk";

  if (ticketsState.loading) {
    return <Loading />;
  }

  if (ticketsState.error) {
    return (
      <ErrorState
        message={ticketsState.error}
      />
    );
  }

  const allTickets =
    ticketsState.data ?? [];

  const teamTickets =
    allTickets.filter(
      (ticket) =>
        ticket.assignmentGroup ===
        selectedTeam
    );

  const activeTickets =
    teamTickets.filter(
      (ticket) =>
        ticket.status !== "Resolved" &&
        ticket.status !== "Closed"
    );

  const unassignedTickets =
    activeTickets.filter(
      (ticket) =>
        !ticket.assignee.trim() ||
        ticket.assignee ===
          "Unassigned"
    );

  const criticalTickets =
    activeTickets.filter(
      (ticket) =>
        ticket.priority ===
        "P1 - Critical"
    );

  const dueLimit =
    Date.now() +
    48 * 60 * 60 * 1000;

  const dueSoonTickets =
    activeTickets.filter(
      (ticket) => {
        const dueTime =
          new Date(
            ticket.dueAt
          ).getTime();

        return (
          !Number.isNaN(dueTime) &&
          dueTime <= dueLimit
        );
      }
    );

  const resolvedTickets =
    teamTickets.filter(
      (ticket) =>
        ticket.status === "Resolved"
    );

  const assignedTickets =
    activeTickets.filter(
      (ticket) =>
        Boolean(
          ticket.assignee.trim()
        ) &&
        ticket.assignee !==
          "Unassigned"
    );

  function selectTeam(
    team: string
  ) {
    const next =
      new URLSearchParams(params);

    next.set("team", team);

    setParams(next);
  }

  function ticketsUrl(
    filters: Record<
      string,
      string
    > = {}
  ) {
    const query =
      new URLSearchParams({
        team: selectedTeam,
        ...filters
      });

    return `/tickets?${query.toString()}`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Team operations"
        title={`${selectedTeam} Dashboard`}
        description="Monitor active, unassigned, critical, due, and resolved tickets for the selected team."
        action={
          <Link
            className="button primary"
            to="/tickets/new"
          >
            + New Ticket
          </Link>
        }
      />

      <div className="toolbar">
        <label className="field">
          <span>
            Assignment group
          </span>

          <select
            value={selectedTeam}
            onChange={(event) =>
              selectTeam(
                event.target.value
              )
            }
          >
            {dashboardTeams.map(
              (team) => (
                <option
                  key={team}
                  value={team}
                >
                  {team}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      <section
        className="metrics team-metrics"
        aria-label={`${selectedTeam} ticket summary`}
      >
        <Link
          className="metric accent-blue metric-link"
          to={ticketsUrl({
            queue: "open"
          })}
        >
          <span>
            Open tickets
          </span>

          <strong>
            {activeTickets.length}
          </strong>

          <small>
            {teamTickets.length} total
            team records
          </small>
        </Link>

        <Link
          className="metric accent-amber metric-link"
          to={ticketsUrl({
            queue: "unassigned"
          })}
        >
          <span>
            Unassigned tickets
          </span>

          <strong>
            {unassignedTickets.length}
          </strong>

          <small>
            Waiting for an engineer
          </small>
        </Link>

        <Link
          className="metric accent-red metric-link"
          to={ticketsUrl({
            priority: "P1"
          })}
        >
          <span>
            Critical
          </span>

          <strong>
            {criticalTickets.length}
          </strong>

          <small>
            Active P1 records
          </small>
        </Link>

        <Link
          className="metric metric-link"
          to={ticketsUrl({
            queue: "due-soon"
          })}
        >
          <span>
            Due within 48h
          </span>

          <strong>
            {dueSoonTickets.length}
          </strong>

          <small>
            Review SLA targets
          </small>
        </Link>

        <Link
          className="metric accent-green metric-link"
          to={ticketsUrl({
            status: "Resolved"
          })}
        >
          <span>
            Resolved
          </span>

          <strong>
            {resolvedTickets.length}
          </strong>

          <small>
            Team resolved records
          </small>
        </Link>
      </section>

      <section className="dashboard-grid">
        <div className="card wide">
          <div className="card-heading">
            <div>
              <h2>
                {selectedTeam} priority
                work
              </h2>

              <p>
                Recently updated active
                records for this team
              </p>
            </div>

            <Link
              to={ticketsUrl()}
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          <TicketTable
            tickets={activeTickets.slice(
              0,
              5
            )}
            compact
          />
        </div>

        <div className="card">
          <div className="card-heading">
            <div>
              <h2>
                Team queue
              </h2>

              <p>
                Current assignment status
              </p>
            </div>
          </div>

          <div className="queue-bars">
            <div>
              <span>
                Unassigned

                <b>
                  {
                    unassignedTickets.length
                  }
                </b>
              </span>

              <div>
                <i
                  style={{
                    width: `${
                      activeTickets.length
                        ? (
                            unassignedTickets.length /
                            activeTickets.length
                          ) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <span>
                Assigned

                <b>
                  {
                    assignedTickets.length
                  }
                </b>
              </span>

              <div>
                <i
                  style={{
                    width: `${
                      activeTickets.length
                        ? (
                            assignedTickets.length /
                            activeTickets.length
                          ) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <span>
                Critical

                <b>
                  {
                    criticalTickets.length
                  }
                </b>
              </span>

              <div>
                <i
                  style={{
                    width: `${
                      activeTickets.length
                        ? (
                            criticalTickets.length /
                            activeTickets.length
                          ) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="safe-banner">
            <ShieldCheck size={19} />

            <div>
              <b>
                Synthetic team dashboard
              </b>

              <small>
                Only fictional records are
                loaded.
              </small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function TicketsPage() {
  const { data, error, loading } = useRemote(api.getTickets, []);
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
const status = params.get("status") ?? "";
const priority = params.get("priority") ?? "";
const team = params.get("team") ?? "";
const queue = params.get("queue") ?? "";
  const filtered = useMemo(() => {
  const now = Date.now();
  const dueLimit =
    now + 48 * 60 * 60 * 1000;

  return (data ?? []).filter((ticket) => {
    const haystack =
      `${ticket.id} ${ticket.shortDescription} ${ticket.requester} ${ticket.assignee} ${ticket.category} ${ticket.assignmentGroup}`
        .toLowerCase();

    const matchesSearch =
      !query ||
      haystack.includes(
        query.toLowerCase()
      );

    const matchesStatus =
      !status ||
      ticket.status === status;

    const matchesPriority =
      !priority ||
      ticket.priority.startsWith(
        priority
      );

    const matchesTeam =
      !team ||
      ticket.assignmentGroup === team;

    const isActive =
      ticket.status !== "Resolved" &&
      ticket.status !== "Closed";

    const isUnassigned =
      !ticket.assignee.trim() ||
      ticket.assignee === "Unassigned";

    const dueTime =
      new Date(
        ticket.dueAt
      ).getTime();

    const queueMatches =
      !queue ||
      (
        queue === "open" &&
        isActive
      ) ||
      (
        queue === "unassigned" &&
        isActive &&
        isUnassigned
      ) ||
      (
        queue === "due-soon" &&
        isActive &&
        !Number.isNaN(dueTime) &&
        dueTime <= dueLimit
      );

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesTeam &&
      queueMatches
    );
  });
}, [
  data,
  query,
  status,
  priority,
  team,
  queue
]);
   
  if (loading) return <Loading/>; if (error) return <ErrorState message={error}/>;
  const updateParam = (key: string, value: string) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); };
  return <><PageHeader
  eyebrow="Work management"
  title="Tickets"
  description="Open any ticket in this tab or use Ctrl/Cmd+Click for a new tab."
  action={
    <Link
      className="button primary"
      to="/tickets/new"
    >
      + New Ticket
    </Link>
  }
/>
    <div className="toolbar"><label className="filter-search"><Search size={17}/><input value={query} onChange={(e) => updateParam('q', e.target.value)} placeholder="Search ticket records"/></label><select value={status} onChange={(e) => updateParam('status', e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{ticketStatuses.map((value) => <option key={value}>{value}</option>)}</select><select value={priority} onChange={(e) => updateParam('priority', e.target.value)} aria-label="Filter by priority"><option value="">All priorities</option><option value="P1">P1 - Critical</option><option value="P2">P2 - High</option><option value="P3">P3 - Moderate</option><option value="P4">P4 - Low</option></select><span className="result-count">{filtered.length} records</span></div>
    <div className="card table-card"><TicketTable tickets={filtered}/></div>
  </>;
}
const assignmentDirectory = {
  "Service Desk": [
    "Demo Operator",
    "Alex Rivera",
    "Morgan Lee"
  ],
  "CSP Support (L1)": [
    "Demo Operator",
    "Jordan Cruz",
    "Taylor Morgan"
  ],
  "Identity Operations": [
    "Priya Shah",
    "Avery Brooks"
  ],
  "Network Operations": [
    "Eli Turner",
    "Riley Kim"
  ],
  "Digital Workplace": [
    "Maya Chen",
    "Noah Wilson"
  ]
} as const;




export function TicketDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const state = useRemote(() => api.getTicket(id), [id]);
  
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");

  const [form, setForm] = useState<TicketUpdate | null>(null);


  useEffect(() => { if (state.data) setForm({ shortDescription: state.data.shortDescription, description: state.data.description, status: state.data.status, priority: state.data.priority, category: state.data.category, assignmentGroup: state.data.assignmentGroup, assignee: state.data.assignee }); }, [state.data]);
  if (state.loading) return <Loading/>; if (state.error || !state.data || !form) return <><button className="back-link" onClick={() => navigate('/tickets')}><ArrowLeft size={16}/>Tickets</button><ErrorState message={state.error || 'Ticket not found'}/></>;
  const ticket = state.data;
  const isClosed = ticket.status === "Closed";

const editableStatuses = ticketStatuses.filter(
  (status) => status !== "Closed"
);
  const dirty = Object.entries(form).some(([key, value]) => ticket[key as keyof Ticket] !== value);
  const set = <K extends keyof TicketUpdate>(key: K, value: TicketUpdate[K]) => { setForm((current) => current ? { ...current, [key]: value } : current); setMessage(''); };
  const save = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setMessage(''); try { const updated = await api.updateTicket(id, form); state.setData(updated); setMessage('Changes saved successfully.'); } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Save failed'); } finally { setSaving(false); } };
  return <>
    <div className="record-top"><Link className="back-link" to="/tickets"><ArrowLeft size={16}/>All tickets</Link><a className="open-new" href={`/tickets/${ticket.id}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/>Open in new tab</a></div>
    <div className="record-title"><div><span className="eyebrow">Incident record</span><h1>{ticket.id}</h1><p>{ticket.requester} · {ticket.location} · Updated {new Date(ticket.updatedAt).toLocaleString()}</p></div><div className="record-badges"><StatusPill status={form.status}/><PriorityPill priority={form.priority}/></div></div> {isClosed && (
  <div className="notice success">
    <ShieldCheck size={18} />

    <div>
      <strong>Closed · Final</strong>

      <div>
        This ticket is read-only and cannot be reopened or modified.
      </div>

      {ticket.closeReason && (
        <div>
          {ticket.closeReason}
        </div>
      )}
    </div>
  </div>
)}

{message && (
  <div
    className={`notice ${
      message.startsWith("Changes")
        ? "success"
        : "error"
    }`}
  >
    {message.startsWith("Changes") && (
      <CheckCircle2 size={18} />
    )}

    {message}
  </div>
)}
    
    <form onSubmit={save} className="record-grid">
      <section className="card form-card"><div className="card-heading"><div><h2>Ticket details</h2><p>Fields marked required must be complete.</p></div></div>
        <label className="field full">
  <span>Short description</span>
  <input
    required
    disabled={isClosed}
    minLength={3}
    maxLength={160}
    value={form.shortDescription}
    onChange={(e) =>
      set("shortDescription", e.target.value)
    }
  />
</label>
        <label className="field full"><span>Description</span><textarea required disabled={isClosed} minLength={3} rows={7} value={form.description} onChange={(e) => set('description', e.target.value)}/></label>
        <div className="field-row">
  <label className="field">
    <span>Status</span>

    <select
      value={form.status}
      disabled={isClosed}
      onChange={(e) =>
        set(
          "status",
          e.target.value as TicketUpdate["status"]
        )
      }
    >
      {isClosed ? (
        <option value="Closed">Closed</option>
      ) : (
        editableStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))
      )}
    </select>
  </label>

  <label className="field">
    <span>Priority</span>

    <select
      value={form.priority}
      disabled={isClosed}
      onChange={(e) =>
        set(
          "priority",
          e.target.value as TicketUpdate["priority"]
        )
      }
    >
      {ticketPriorities.map((priority) => (
        <option key={priority} value={priority}>
          {priority}
        </option>
      ))}
    </select>
  </label>
</div>

<div className="field-row">
  <label className="field">
    <span>Category</span>

    <input
      required
      disabled={isClosed}
      value={form.category}
      onChange={(e) =>
        set("category", e.target.value)
      }
    />
  </label>

  <label className="field">
  <span>Assignment group</span>

  <select
    required
    disabled={isClosed}
    value={form.assignmentGroup}
    onChange={(e) => {
      set("assignmentGroup", e.target.value);
      set("assignee", "");
    }}
  >
    <option value="">
      Select assignment group
    </option>

    {Object.keys(assignmentDirectory).map((group) => (
      <option key={group} value={group}>
        {group}
      </option>
    ))}
  </select>
</label>
</div>

<label className="field full">
  <span>Assigned to</span>

  <input
    required
    disabled={isClosed}
    list="assignment-members"
    value={form.assignee}
    onChange={(e) =>
      set("assignee", e.target.value)
    }
    placeholder="Search assigned engineer..."
  />

  <datalist id="assignment-members">
    {(
      assignmentDirectory[
        form.assignmentGroup as keyof typeof assignmentDirectory
      ] ?? []
    ).map((person) => (
      <option
        key={person}
        value={person}
      />
    ))}
  </datalist>
</label>


        
        <div className="form-actions">
  <span>
    {isClosed
      ? "Closed ticket — read only"
      : dirty
        ? "Unsaved changes"
        : "All changes saved"}
  </span>

  <button
    className="button primary"
    type="submit"
    disabled={isClosed || !dirty || saving}
  >
    <Save size={17} />

    {isClosed
      ? "Closed"
      : saving
        ? "Saving…"
        : "Save changes"}
  </button>
</div></section>
      <aside><section className="card facts"><h2>Record information</h2><dl><div><dt>Requester</dt><dd>{ticket.requester}</dd></div><div><dt>Email</dt><dd>{ticket.requesterEmail}</dd></div><div><dt>Asset</dt><dd>{ticket.asset}</dd></div><div><dt>Created</dt><dd>{new Date(ticket.createdAt).toLocaleString()}</dd></div><div><dt>Due</dt><dd>{new Date(ticket.dueAt).toLocaleString()}</dd></div></dl></section><section className="card activity"><h2>Activity</h2>{ticket.activity.length ? ticket.activity.map((item) => <article key={item.id}><span>{item.author.slice(0, 1)}</span><div><b>{item.author}</b><time>{new Date(item.at).toLocaleString()}</time><p>{item.body}</p></div></article>) : <p className="muted">No activity yet.</p>}</section></aside>
    </form>
  </>;
}
export function CallsPage() {
  const {
    data,
    error,
    loading,
    setData
  } = useRemote<CallRecord[]>(
    api.getCalls,
    []
  );

  const navigate = useNavigate();

  const [converting, setConverting] =
    useState("");

  const [message, setMessage] =
    useState("");

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
      />
    );
  }

  const calls = data ?? [];

  async function convertCall(
    call: CallRecord
  ) {
    if (
      call.status === "Converted"
    ) {
      return;
    }

    setConverting(call.id);
    setMessage("");

    try {
      const result =
        await api.convertCall(
          call.id,
          call.assignmentGroup
        );

      setData(
        calls.map((item) =>
          item.id === call.id
            ? result.call
            : item
        )
      );

      navigate(
        `/tickets/${result.ticket.id}`
      );
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Unable to convert call."
      );
    } finally {
      setConverting("");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Email intake"
        title="Calls"
        description="Review synthetic email intake records and convert them into team incidents."
      />

      {message && (
        <div className="notice error">
          {message}
        </div>
      )}

      <div className="card table-card">
        {calls.length === 0 ? (
          <div className="loading">
            No CALL records yet.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto"
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >
              <thead>
                <tr>
                  <th>Call</th>
                  <th>Subject</th>
                  <th>Source</th>
                  <th>Requester</th>
                  <th>Priority</th>
                  <th>
                    Assignment Group
                  </th>
                  <th>Status</th>
                  <th>Incident</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {calls.map((call) => (
                  <tr key={call.id}>
                    <td>
  <Link
    className="ticket-link"
    to={`/calls/${call.id}`}
  >
    {call.id}
  </Link>
</td>

                    <td>
                      {call.subject}
                    </td>

                    <td>
                      {call.source}
                    </td>

                    <td>
                      <div>
                        {call.requester}
                      </div>

                      <small>
                        {
                          call.requesterEmail
                        }
                      </small>
                    </td>

                    <td>
                      <PriorityPill
                        priority={
                          call.priority
                        }
                      />
                    </td>

                    <td>
                      {
                        call.assignmentGroup
                      }
                    </td>

                    <td>
                      <span
                        className={
                          call.status ===
                          "Converted"
                            ? "mode-chip"
                            : "result-count"
                        }
                      >
                        {call.status}
                      </span>
                    </td>

                    <td>
                      {call.convertedTicketId ? (
                        <Link
                          to={`/tickets/${call.convertedTicketId}`}
                        >
                          {
                            call.convertedTicketId
                          }
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <button
                        className="button primary"
                        type="button"
                        disabled={
                          call.status ===
                            "Converted" ||
                          converting ===
                            call.id
                        }
                        onClick={() =>
                          convertCall(call)
                        }
                      >
                        {call.status ===
                        "Converted"
                          ? "Converted"
                          : converting ===
                              call.id
                            ? "Converting..."
                            : "Convert to Incident"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  ); }
export function CallDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const state = useRemote(
    () => api.getCall(id),
    [id]
  );

  const [assignmentGroup, setAssignmentGroup] =
    useState("");

  const [converting, setConverting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (state.data) {
      setAssignmentGroup(
        state.data.assignmentGroup
      );
    }
  }, [state.data]);

  if (state.loading) {
    return <Loading />;
  }

  if (state.error || !state.data) {
    return (
      <>
        <Link
          className="back-link"
          to="/calls"
        >
          <ArrowLeft size={16} />
          Calls
        </Link>

        <ErrorState
          message={
            state.error ||
            "Call not found"
          }
        />
      </>
    );
  }

  const call = state.data;

  const converted =
    call.status === "Converted";

  async function convert() {
    if (
      !assignmentGroup ||
      converted
    ) {
      return;
    }

    setConverting(true);
    setMessage("");

    try {
      const result =
        await api.convertCall(
          call.id,
          assignmentGroup
        );

      state.setData(
        result.call
      );

      navigate(
        `/tickets/${result.ticket.id}`
      );
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "Unable to convert call."
      );
    } finally {
      setConverting(false);
    }
  }

  return (
    <>
      <div className="record-top">
        <Link
          className="back-link"
          to="/calls"
        >
          <ArrowLeft size={16} />
          All calls
        </Link>
      </div>

      <div className="record-title">
        <div>
          <span className="eyebrow">
            Email intake record
          </span>

          <h1>
            {call.id}
          </h1>

          <p>
            {call.requester} · {call.source} ·{" "}
            {new Date(
              call.updatedAt
            ).toLocaleString()}
          </p>
        </div>

        <div className="record-badges">
          <PriorityPill
            priority={
              call.priority
            }
          />
        </div>
      </div>

      {message && (
        <div className="notice error">
          {message}
        </div>
      )}

      {converted && (
        <div className="notice success">
          <CheckCircle2 size={18} />

          <div>
            <strong>
              Converted to Incident
            </strong>

            <div>
              {call.convertedTicketId
                ? `This call was converted to ${call.convertedTicketId}.`
                : "This call has already been converted."}
            </div>
          </div>
        </div>
      )}

      <div className="record-grid">
        <section className="card form-card">
          <div className="card-heading">
            <div>
              <h2>
                Call details
              </h2>

              <p>
                Review the email intake and confirm
                the correct team before conversion.
              </p>
            </div>
          </div>

          <label className="field full">
            <span>
              Subject
            </span>

            <input
              value={
                call.subject
              }
              disabled
            />
          </label>

          <label className="field full">
            <span>
              Description
            </span>

            <textarea
              value={
                call.description
              }
              rows={7}
              disabled
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>
                Requester
              </span>

              <input
                value={
                  call.requester
                }
                disabled
              />
            </label>

            <label className="field">
              <span>
                Requester email
              </span>

              <input
                value={
                  call.requesterEmail
                }
                disabled
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>
                Category
              </span>

              <input
                value={
                  call.category
                }
                disabled
              />
            </label>

            <label className="field">
              <span>
                Priority
              </span>

              <input
                value={
                  call.priority
                }
                disabled
              />
            </label>
          </div>

          <label className="field full">
            <span>
              Assignment Group
            </span>

            <select
              value={
                assignmentGroup
              }
              disabled={
                converted
              }
              onChange={(event) =>
                setAssignmentGroup(
                  event.target.value
                )
              }
            >
              <option value="">
                Select assignment group
              </option>

              {Object.keys(
                assignmentDirectory
              ).map((group) => (
                <option
                  key={group}
                  value={group}
                >
                  {group}
                </option>
              ))}
            </select>
          </label>

          <label className="field full">
            <span>
              Assigned To
            </span>

            <input
              value="Unassigned"
              disabled
            />
          </label>

          <div className="form-actions">
            <span>
              {converted
                ? `Converted to ${
                    call.convertedTicketId ??
                    "incident"
                  }`
                : "Confirm the team routing before conversion"}
            </span>

            <button
              className="button primary"
              type="button"
              disabled={
                converting ||
                !assignmentGroup ||
                converted
              }
              onClick={
                convert
              }
            >
              {converted
                ? "Converted"
                : converting
                  ? "Converting..."
                  : "Convert to Incident"}
            </button>
          </div>
        </section>

        <aside>
          <section className="card facts">
            <h2>
              Intake information
            </h2>

            <dl>
              <div>
                <dt>
                  Source
                </dt>

                <dd>
                  {call.source}
                </dd>
              </div>

              <div>
                <dt>
                  Status
                </dt>

                <dd>
                  {call.status}
                </dd>
              </div>

              <div>
                <dt>
                  Suggested team
                </dt>

                <dd>
                  {
                    call.assignmentGroup
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Location
                </dt>

                <dd>
                  {call.location}
                </dd>
              </div>

              <div>
                <dt>
                  Asset
                </dt>

                <dd>
                  {call.asset}
                </dd>
              </div>

              <div>
                <dt>
                  Created
                </dt>

                <dd>
                  {new Date(
                    call.createdAt
                  ).toLocaleString()}
                </dd>
              </div>

              {call.convertedTicketId && (
                <div>
                  <dt>
                    Incident
                  </dt>

                  <dd>
                    <Link
                      to={`/tickets/${call.convertedTicketId}`}
                    >
                      {
                        call.convertedTicketId
                      }
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="card activity">
            <h2>
              Routing
            </h2>

            <p className="muted">
              OrbitDesk provides the current
              Assignment Group from the email
              intake. Review or change the team
              before conversion.
            </p>

            <p className="muted">
              The converted incident enters the
              selected team's queue with Assigned
              To set to Unassigned.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
export function KnowledgePage() {
  const { data, error, loading } = useRemote(api.getKnowledge, []); const [query, setQuery] = useState('');
  if (loading) return <Loading/>; if (error) return <ErrorState message={error}/>;
  const articles = (data ?? []).filter((article) => `${article.id} ${article.title} ${article.summary} ${article.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeader eyebrow="Self service" title="Knowledge" description="The local corpus used by OrbitDesk's deterministic retrieval pipeline."/><label className="knowledge-search"><Search size={19}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bundled knowledge"/></label><div className="knowledge-grid">{articles.map((article) => <article className="card article" key={article.id}><span>{article.id}</span><h2>{article.title}</h2><p>{article.summary}</p><div>{article.tags.map((tag) => <small key={tag}>{tag}</small>)}</div></article>)}</div></>;
}

export function AssistantPage() {
  const tickets = useRemote(api.getTickets, []); const [question, setQuestion] = useState('How should I troubleshoot a VPN that disconnects after sleep?'); const [ticketId, setTicketId] = useState('INC1042'); const [answer, setAnswer] = useState<AiAnswer | null>(null); const [working, setWorking] = useState(false); const [error, setError] = useState('');
  const ask = async (event: FormEvent) => { event.preventDefault(); setWorking(true); setError(''); try { setAnswer(await api.askAi(question, ticketId)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Request failed'); } finally { setWorking(false); } };
  return <><PageHeader eyebrow="Mock AI workspace" title="Orbit AI assistant" description="Grounded, deterministic guidance from the bundled synthetic knowledge base."/><div className="assistant-grid"><form className="card prompt-card" onSubmit={ask}><div className="assistant-icon"><Bot size={25}/></div><label className="field"><span>Related ticket (optional)</span><select value={ticketId} onChange={(e) => setTicketId(e.target.value)}><option value="">No ticket</option>{(tickets.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.id} — {t.shortDescription}</option>)}</select></label><label className="field"><span>Question</span><textarea rows={7} minLength={3} required value={question} onChange={(e) => setQuestion(e.target.value)}/></label><button className="button primary" disabled={working}><Sparkles size={17}/>{working ? 'Retrieving…' : 'Generate grounded guidance'}</button><p className="fine-print"><ShieldCheck size={15}/>No external AI call. Do not enter real customer data or secrets.</p></form><section className="card answer-card">{error && <ErrorState message={error}/>} {!answer && !error && <div className="answer-placeholder"><Sparkles size={30}/><h2>Ready when you are</h2><p>Ask about a synthetic ticket or support scenario.</p></div>}{answer && <><div className="card-heading"><div><h2>Suggested response</h2><p>{answer.disclaimer}</p></div></div><div className="answer-text">{answer.answer}</div><h3>Recommended actions</h3><ol>{answer.suggestedActions.map((action) => <li key={action}>{action}</li>)}</ol><h3>Retrieved sources</h3>{answer.citations.map((citation) => <div className="citation" key={citation.id}><b>{citation.id} · {citation.title}</b><span>{citation.summary}</span></div>)}</>}</section></div></>;
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  return <><PageHeader eyebrow="Preferences" title="Settings" description="Personalize this browser without changing the shared prototype."/><div className="settings-grid"><section className="card setting-row"><div><h2>Appearance</h2><p>Use a comfortable theme. The web choice is stored in this browser.</p></div><button className="button secondary" onClick={toggleTheme}>Switch to {theme === 'light' ? 'dark' : 'light'}</button></section><section className="card setting-row"><div><h2>Data mode</h2><p>OrbitDesk is locked to synthetic prototype data and local mock AI guidance.</p></div><span className="mode-chip"><ShieldCheck size={16}/>Safe prototype</span></section></div></>;
}

export function NotFoundPage() {
  const location = useLocation();
  return <div className="not-found"><strong>404</strong><h1>Page not found</h1><p>No route exists for {location.pathname}.</p><Link className="button primary" to="/">Return to dashboard</Link></div>;
}
export function NewTicketPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<TicketCreate>({
    shortDescription: "",
    description: "",
    priority: "P3 - Moderate",
    category: "General",
    assignmentGroup: "Service Desk",
    assignee: "Demo Operator",
    requester: "",
    requesterEmail: "",
    location: "Synthetic Lab",
    asset: "SYN-ASSET",
    tags: []
  });

  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof TicketCreate>(
    key: K,
    value: TicketCreate[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));

    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const created = await api.createTicket({
        ...form,
        tags: tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      });

      navigate(`/tickets/${created.id}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create ticket."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="record-top">
        <Link className="back-link" to="/tickets">
          <ArrowLeft size={16} />
          All tickets
        </Link>
      </div>

      <PageHeader
        eyebrow="Service Desk"
        title="Create Incident"
        description="Create a new synthetic OrbitDesk incident."
      />

      {error && (
        <div className="notice error">
          {error}
        </div>
      )}

      <form className="record-grid" onSubmit={submit}>
        <section className="card form-card">
          <div className="card-heading">
            <div>
              <h2>New ticket</h2>
              <p>
                Complete the required fields before creating the incident.
              </p>
            </div>
          </div>

          <label className="field full">
            <span>Short description</span>
            <input
              required
              minLength={3}
              maxLength={160}
              value={form.shortDescription}
              onChange={(e) =>
                set("shortDescription", e.target.value)
              }
              placeholder="Brief incident summary"
            />
          </label>

          <label className="field full">
            <span>Description</span>
            <textarea
              required
              minLength={3}
              maxLength={5000}
              rows={7}
              value={form.description}
              onChange={(e) =>
                set("description", e.target.value)
              }
              placeholder="Describe the issue and impact"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Requester</span>
              <input
                required
                value={form.requester}
                onChange={(e) =>
                  set("requester", e.target.value)
                }
                placeholder="Demo User"
              />
            </label>

            <label className="field">
              <span>Requester email</span>
              <input
                required
                type="email"
                value={form.requesterEmail}
                onChange={(e) =>
                  set("requesterEmail", e.target.value)
                }
                placeholder="demo.user@example.invalid"
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Priority</span>

              <select
                value={form.priority}
                onChange={(e) =>
                  set(
                    "priority",
                    e.target.value as TicketCreate["priority"]
                  )
                }
              >
                {ticketPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Category</span>
              <input
                required
                value={form.category}
                onChange={(e) =>
                  set("category", e.target.value)
                }
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Assignment group</span>
              <input
              required
                value={form.assignmentGroup}
                onChange={(e) =>
                  set("assignmentGroup", e.target.value)
                }
              />
            </label>

            <label className="field">
              <span>Assigned to</span>
              <input
                required
                value={form.assignee}
                onChange={(e) =>
                  set("assignee", e.target.value)
                }
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Location</span>
              <input
                required
                value={form.location}
                onChange={(e) =>
                  set("location", e.target.value)
                }
              />
            </label>

            <label className="field">
              <span>Asset</span>
              <input
                required
                value={form.asset}
                onChange={(e) =>
                  set("asset", e.target.value)
                }
              />
            </label>
          </div>

          <label className="field full">
            <span>Tags</span>
            <input
              value={tagsText}
              onChange={(e) =>
                setTagsText(e.target.value)
              }
              placeholder="vpn, network, remote-access"
            />
          </label>

          <div className="form-actions">
            <span>
              New incidents start with Status: New.
            </span>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                className="button secondary"
                to="/tickets"
              >
                Cancel
              </Link>

              <button
                className="button primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>
        </section>

        <aside>
          <section className="card facts">
            <h2>Ticket lifecycle</h2>

            <dl>
              <div>
                <dt>Initial status</dt>
                <dd>New</dd>
              </div>

              <div>
                <dt>Ticket number</dt>
                <dd>Automatic INCxxxx</dd>
              </div>

              <div>
                <dt>Due date</dt>
                <dd>Based on priority</dd>
              </div>

              <div>
                <dt>Resolved</dt>
                <dd>3-day confirmation</dd>
              </div>

              <div>
                <dt>Closed</dt>
                <dd>Final / locked</dd>
              </div>
            </dl>
          </section>

          <section className="card activity">
            <h2>Prototype safety</h2>

            <p className="muted">
              Use fictional information only. Requester email must use the
              @example.invalid domain.
            </p>
          </section>
        </aside>
      </form>
    </>
  );
}
