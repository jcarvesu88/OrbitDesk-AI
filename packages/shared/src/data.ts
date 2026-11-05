import type { KnowledgeArticle, Ticket } from './types.js';

export const syntheticTickets: Ticket[] = [
  {
    id: 'INC1042', shortDescription: 'VPN disconnects after device sleep',
    description: 'The synthetic requester can connect to Northstar VPN, but the tunnel drops after the laptop resumes from sleep.',
    status: 'In Progress', priority: 'P2 - High', category: 'Network', assignmentGroup: 'Digital Workplace', assignee: 'Maya Chen', requester: 'Avery Brooks', requesterEmail: 'avery.brooks@example.invalid', location: 'Harbor Point - 4F', asset: 'NB-SYN-2048',
    createdAt: '2026-10-29T01:20:00.000Z', updatedAt: '2026-10-31T02:15:00.000Z', dueAt: '2026-11-01T08:00:00.000Z', tags: ['vpn', 'laptop', 'remote-access'],
    activity: [
      { id: 'a-1042-1', author: 'Avery Brooks', at: '2026-10-29T01:20:00.000Z', body: 'Issue occurs after every sleep cycle on the synthetic test laptop.' },
      { id: 'a-1042-2', author: 'Maya Chen', at: '2026-10-31T02:15:00.000Z', body: 'Collected the mock client log and confirmed the reconnect service is stopped.' }
    ]
  },
  {
    id: 'INC1041', shortDescription: 'Finance printer queue remains paused',
    description: 'A fictional shared printer queue shows Paused for the finance lab workstations.',
    status: 'Pending', priority: 'P3 - Moderate', category: 'Hardware', assignmentGroup: 'Field Services', assignee: 'Noah Wilson', requester: 'Jordan Lee', requesterEmail: 'jordan.lee@example.invalid', location: 'Orchid Center - 7F', asset: 'PRN-SYN-017',
    createdAt: '2026-10-28T03:15:00.000Z', updatedAt: '2026-10-30T07:40:00.000Z', dueAt: '2026-11-03T08:00:00.000Z', tags: ['printer', 'queue'],
    activity: [{ id: 'a-1041-1', author: 'Noah Wilson', at: '2026-10-30T07:40:00.000Z', body: 'Waiting for a synthetic maintenance window to restart the spooler host.' }]
  },
  {
    id: 'INC1039', shortDescription: 'Repeated MFA prompt in collaboration app',
    description: 'A test account receives repeated sign-in prompts in the desktop collaboration client.',
    status: 'New', priority: 'P2 - High', category: 'Identity', assignmentGroup: 'Identity Operations', assignee: 'Priya Shah', requester: 'Taylor Morgan', requesterEmail: 'taylor.morgan@example.invalid', location: 'Remote - Synthetic', asset: 'NB-SYN-1983',
    createdAt: '2026-10-30T05:45:00.000Z', updatedAt: '2026-10-30T05:45:00.000Z', dueAt: '2026-11-01T02:00:00.000Z', tags: ['mfa', 'identity'], activity: []
  },
  {
    id: 'INC1037', shortDescription: 'Warehouse scanner cannot join Wi-Fi',
    description: 'The demonstration handheld scanner cannot authenticate to the isolated warehouse SSID.',
    status: 'In Progress', priority: 'P1 - Critical', category: 'Network', assignmentGroup: 'Network Operations', assignee: 'Eli Turner', requester: 'Riley Kim', requesterEmail: 'riley.kim@example.invalid', location: 'Demo Warehouse A', asset: 'SCN-SYN-088',
    createdAt: '2026-10-30T00:10:00.000Z', updatedAt: '2026-10-31T03:05:00.000Z', dueAt: '2026-10-31T07:00:00.000Z', tags: ['wifi', 'scanner', 'warehouse'],
    activity: [{ id: 'a-1037-1', author: 'Eli Turner', at: '2026-10-31T03:05:00.000Z', body: 'Synthetic certificate expiry reproduced in the lab profile.' }]
  },
  {
    id: 'INC1033', shortDescription: 'Spreadsheet add-in missing after update',
    description: 'The reporting add-in is absent after the synthetic office suite update.',
    status: 'Resolved', priority: 'P3 - Moderate', category: 'Software', assignmentGroup: 'Digital Workplace', assignee: 'Maya Chen', requester: 'Morgan Diaz', requesterEmail: 'morgan.diaz@example.invalid', location: 'Harbor Point - 6F', asset: 'NB-SYN-1888',
    createdAt: '2026-10-24T02:00:00.000Z', updatedAt: '2026-10-29T09:25:00.000Z', dueAt: '2026-10-30T08:00:00.000Z', tags: ['office', 'addin'],
    activity: [{ id: 'a-1033-1', author: 'Maya Chen', at: '2026-10-29T09:25:00.000Z', body: 'Re-enabled the fictional add-in package and validated launch.' }]
  },
  {
    id: 'INC1029', shortDescription: 'New starter needs analytics workspace access',
    description: 'Provision read-only access to the fictional analytics workspace for a test onboarding flow.',
    status: 'Pending', priority: 'P4 - Low', category: 'Access', assignmentGroup: 'Access Fulfillment', assignee: 'Sam Ortega', requester: 'Casey Patel', requesterEmail: 'casey.patel@example.invalid', location: 'Remote - Synthetic', asset: 'N/A',
    createdAt: '2026-10-27T06:10:00.000Z', updatedAt: '2026-10-30T01:00:00.000Z', dueAt: '2026-11-05T08:00:00.000Z', tags: ['access', 'onboarding'], activity: []
  },
  {
    id: 'INC1026', shortDescription: 'Conference room display shows no signal',
    description: 'The demo conference room display does not detect the room PC input.',
    status: 'In Progress', priority: 'P3 - Moderate', category: 'Hardware', assignmentGroup: 'Field Services', assignee: 'Noah Wilson', requester: 'Jamie Park', requesterEmail: 'jamie.park@example.invalid', location: 'Orchid Center - Atlas Room', asset: 'DSP-SYN-031',
    createdAt: '2026-10-26T00:20:00.000Z', updatedAt: '2026-10-30T06:10:00.000Z', dueAt: '2026-11-02T08:00:00.000Z', tags: ['meeting-room', 'display'], activity: []
  },
  {
    id: 'INC1021', shortDescription: 'Developer sandbox storage alert',
    description: 'A synthetic non-production sandbox reached 90 percent disk utilization.',
    status: 'Resolved', priority: 'P4 - Low', category: 'Infrastructure', assignmentGroup: 'Cloud Platform', assignee: 'Alex Rivera', requester: 'Drew Bell', requesterEmail: 'drew.bell@example.invalid', location: 'Cloud - Demo Tenant', asset: 'VM-SYN-DEV-12',
    createdAt: '2026-10-22T05:05:00.000Z', updatedAt: '2026-10-27T03:30:00.000Z', dueAt: '2026-10-29T08:00:00.000Z', tags: ['storage', 'sandbox'], activity: []
  }
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'KB-2001', title: 'Restore VPN connectivity after sleep',
    summary: 'Restart the reconnect service, refresh the device tunnel, and capture logs if the issue returns.',
    content: 'Confirm the device has internet access. Restart the Northstar VPN reconnect service, then disconnect and reconnect the test tunnel. If it fails again, capture the client log, record the sleep/resume time, and route the ticket to Digital Workplace. Do not request or paste passwords, recovery keys, or real user data.',
    tags: ['vpn', 'sleep', 'remote-access', 'reconnect'], updatedAt: '2026-10-20T00:00:00.000Z'
  },
  {
    id: 'KB-2002', title: 'Clear a paused shared printer queue',
    summary: 'Validate queue state, clear safe test jobs, and restart the spooler during an approved window.',
    content: 'Check whether the queue is paused on the server or only on one workstation. Remove synthetic test jobs, resume the queue, and print a test page. Restart the spooler only during an approved maintenance window. Escalate hardware faults to Field Services.',
    tags: ['printer', 'queue', 'spooler'], updatedAt: '2026-09-18T00:00:00.000Z'
  },
  {
    id: 'KB-2003', title: 'Troubleshoot repeated MFA prompts',
    summary: 'Check clock, account state, client cache, and token registration without collecting secrets.',
    content: 'Verify device time synchronization and the synthetic account status. Sign out of the affected client, clear only its documented token cache, and sign in again. Never ask for an MFA code, password, or recovery key. Escalate persistent token loops to Identity Operations.',
    tags: ['mfa', 'identity', 'authentication', 'token'], updatedAt: '2026-10-08T00:00:00.000Z'
  },
  {
    id: 'KB-2004', title: 'Renew a managed Wi-Fi device certificate',
    summary: 'Validate certificate expiry and trigger managed profile renewal for enrolled devices.',
    content: 'Confirm the device is enrolled and inspect the managed Wi-Fi certificate expiry. Trigger a policy sync and certificate renewal from the test management console. Do not export private keys. If renewal fails, assign to Network Operations with the sanitized enrollment log.',
    tags: ['wifi', 'certificate', 'scanner', 'network'], updatedAt: '2026-10-26T00:00:00.000Z'
  },
  {
    id: 'KB-2005', title: 'Restore a disabled productivity add-in',
    summary: 'Check disabled items, policy assignment, and package health before reinstalling.',
    content: 'Review the application disabled-items list and the synthetic policy assignment. Re-enable the approved add-in, restart the application, and validate with a blank document. Reinstall the managed package only if the add-in files are missing.',
    tags: ['office', 'addin', 'software'], updatedAt: '2026-09-30T00:00:00.000Z'
  },
  {
    id: 'KB-2006', title: 'Triage a conference room no-signal report',
    summary: 'Check input selection, cable path, room PC output, and display power in a safe order.',
    content: 'Confirm the display is powered on and set to the documented room PC input. Reseat the presentation cable, wake the room PC, and test the spare input. Record which segment fails and route physical cable or display faults to Field Services.',
    tags: ['meeting-room', 'display', 'hardware', 'signal'], updatedAt: '2026-08-22T00:00:00.000Z'
  }
];

