import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";

import {
  AppShell
} from "./components";

import {
  AssistantPage,
  DashboardPage,
  KnowledgePage,
  NewTicketPage,
  NotFoundPage,
  SettingsPage,
  TicketDetailPage,
  CallDetailPage,
  CallsPage,
  TicketsPage
} from "./pages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            index
            element={<DashboardPage />}
          />
<Route
  path="calls"
  element={<CallsPage />}
/>

<Route
  path="calls/:id"
  element={<CallDetailPage />}
/>
          <Route
            path="tickets"
            element={<TicketsPage />}
          />

          {/* Must stay before tickets/:id */}
          <Route
            path="tickets/new"
            element={<NewTicketPage />}
          />

          <Route
            path="tickets/:id"
            element={<TicketDetailPage />}
          />

          <Route
            path="knowledge"
            element={<KnowledgePage />}
          />

          <Route
            path="assistant"
            element={<AssistantPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}