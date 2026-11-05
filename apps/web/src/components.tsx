import {
  Bot,
  ChevronDown,
  ChevronRight,
  CircleGauge,
  FileText,
  Inbox,
  Menu,
  Moon,
  Mail,
  Search,
  Settings,
  Star,
  Sun,
  TicketCheck,
  X
} from "lucide-react";
import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import type { Ticket, TicketPriority, TicketStatus } from '@orbitdesk/shared';
import { useTheme } from './theme';

const nav = [
  { to: '/', label: 'Overview', icon: CircleGauge },
  {
  to: "/calls",
  label: "Calls",
  icon: Mail
},
  { to: '/tickets', label: 'All tickets', icon: Inbox },
  { to: '/knowledge', label: 'Knowledge', icon: FileText },
  { to: '/assistant', label: 'AI assistant', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark">O</span><span><b>OrbitDesk</b><small>AI service operations</small></span><button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20}/></button></div>
      <div className="environment"><span></span>Synthetic prototype</div>
      <nav aria-label="Primary">
        <p className="nav-label">Workspace</p>
        {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}><Icon size={18}/><span>{label}</span></NavLink>)}
        <button className="nav-group" onClick={() => setFavoritesOpen((v) => !v)}>{favoritesOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}<Star size={16}/><span>Favorites</span></button>
        {favoritesOpen && <div className="favorites">
          <NavLink to="/tickets?status=New"><span className="dot blue"></span>New tickets</NavLink>
          <NavLink to="/tickets?priority=P1"><span className="dot red"></span>Critical queue</NavLink>
          <NavLink to="/tickets?assignee=Maya"><span className="dot violet"></span>My work</NavLink>
        </div>}
      </nav>
      <div className="sidebar-footer"><button className="theme-button" onClick={toggleTheme}>{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}<span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span></button><div className="profile"><span>OD</span><div><b>Demo operator</b><small>Service Desk</small></div></div></div>
    </aside>
    {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="global-search"><Search size={18}/><input aria-label="Global search" placeholder="Search tickets and knowledge" onKeyDown={(event) => { if (event.key === 'Enter' && event.currentTarget.value.trim()) window.location.href = `/tickets?q=${encodeURIComponent(event.currentTarget.value)}`; }}/><kbd>⌘ K</kbd></div><button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? <Moon size={19}/> : <Sun size={19}/>}</button></header>
      <div className="page"><Outlet/></div>
    </main>
  </div>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

export function StatusPill({ status }: { status: TicketStatus }) {
  return <span className={`pill status-${status.toLowerCase().replace(' ', '-')}`}><span></span>{status}</span>;
}

export function PriorityPill({ priority }: { priority: TicketPriority }) {
  return <span className={`priority priority-${priority.slice(1, 2)}`}>{priority}</span>;
}

export function TicketTable({ tickets, compact = false }: { tickets: Ticket[]; compact?: boolean }) {
  if (!tickets.length) return <div className="empty-state"><TicketCheck size={28}/><h3>No tickets match</h3><p>Try another queue or search term.</p></div>;
  return <div className="table-wrap"><table><thead><tr><th>Number</th><th>Short description</th><th>Status</th><th>Priority</th>{!compact && <><th>Assigned to</th><th>Updated</th></>}</tr></thead><tbody>{tickets.map((ticket) => <tr key={ticket.id}>
    <td><Link className="ticket-link" to={`/tickets/${ticket.id}`} title="Open ticket; Ctrl/Cmd+Click opens a new tab">{ticket.id}</Link></td>
    <td><Link className="description-link" to={`/tickets/${ticket.id}`}>{ticket.shortDescription}</Link><small>{ticket.category} · {ticket.assignmentGroup}</small></td>
    <td><StatusPill status={ticket.status}/></td><td><PriorityPill priority={ticket.priority}/></td>
    {!compact && <><td>{ticket.assignee}</td><td>{formatRelative(ticket.updatedAt)}</td></>}
  </tr>)}</tbody></table></div>;
}

export function formatRelative(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
