# CyberTrace — Frontend

React + Vite frontend for the CyberTrace backend. Talks to the Spring Boot
API over plain `fetch`/axios with a JWT stored in `localStorage`.

## Setup

```bash
npm install
npm run dev
```

Opens at **http://localhost:3000** — this port is forced in `vite.config.js`
specifically because the backend's `SecurityConfig.java` only allows CORS
from `http://localhost:3000`. If you ever change the frontend port, update
`corsConfigurationSource()` in the backend to match, or you'll get CORS
errors in the browser console.

**Your backend must already be running on `http://localhost:8080`** (via
`.\mvnw.cmd spring-boot:run` in the backend project) before you start the
frontend — the frontend makes no sense without it.

## What's included

```
src/
├── api/axios.js          Axios instance — attaches JWT to every request,
│                         auto-logs-out on 401
├── context/AuthContext.jsx   Login/register/logout state, persisted to
│                             localStorage so refresh doesn't log you out
├── components/
│   ├── Navbar.jsx         Top nav, role-aware (Admin sees extra links)
│   └── ProtectedRoute.jsx Route guard — redirects to /login if not
│                          authenticated, or to /dashboard if wrong role
├── pages/
│   ├── Login.jsx / Register.jsx
│   ├── Dashboard.jsx      Role-aware home: stats + recent cases
│   │                      (Admin sees all cases, Investigator sees
│   │                      only their assigned ones)
│   ├── Cases.jsx          Full case list + create-case form
│   ├── CaseDetail.jsx     The big one — tabs for Evidence (upload +
│   │                      SHA-256 hash display + chain-of-custody
│   │                      drill-down), Investigation Notes, Findings
│   ├── AdminUsers.jsx     Admin-only: list users, enable/disable
│   └── AdminAuditLogs.jsx Admin-only: audit trail table
└── styles.css             Dark "investigation console" theme
```

## How auth flows

1. `/register` → `POST /api/auth/register` (choose ADMIN or INVESTIGATOR)
2. `/login` → `POST /api/auth/login` → backend returns a JWT → stored in
   `localStorage` as `ct_token`
3. Every subsequent API call automatically attaches
   `Authorization: Bearer <token>` via the axios interceptor
4. If the backend ever returns 401 (expired/invalid token), the interceptor
   clears storage and bounces you back to `/login`

## Testing without the UI (Postman)

You can still hit the backend directly with Postman exactly as described in
the backend's own README — the frontend is just a UI layer on top of the
same REST API. Both can be used interchangeably; whatever you create via
Postman shows up in the UI and vice versa, since they're hitting the same
database.

## Known gaps / good next steps for you to extend yourself

- No pagination on the cases/users/audit-log tables — fine for a demo
  dataset, would need it for anything larger.
- No "assign investigator" dropdown on case creation yet — `CaseRequest`
  already supports `assignedToUserId`, the form just doesn't expose a
  picker. Good small feature to add yourself: fetch
  `/api/admin/investigators` and render a `<select>`.
- No PDF "Generate Investigation Report" button yet (your poster lists
  this as a feature) — you'd combine the case + notes + findings data
  into a printable view. A reasonable approach: a new route
  `/cases/:id/report` that renders a print-friendly page and calls
  `window.print()`, or a backend endpoint that returns a generated PDF.
- No file download/preview for uploaded evidence — currently you can
  upload and see metadata/hash, but there's no "download original file"
  button wired up. The backend already stores the file on disk
  (`storagePath`); you'd add a `GET /api/evidence/{id}/download` endpoint
  that streams it back.
