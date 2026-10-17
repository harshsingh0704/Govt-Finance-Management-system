# IT Cell Incharge Dashboard — Local Prototype

This is a standalone React + Vite dashboard for the **IT Cell Incharge** role in Government FMS. It does not connect to the existing client/server or require MongoDB. That lets you build and test the dashboard independently before your team integrates authentication and APIs.

## Included

- Overview dashboard with ticket and asset counts
- Helpdesk ticket creation, search, and local status updates
- IT asset register with add/search
- Maintenance queue
- Basic reports and CSV export
- Notifications based on unresolved sample tickets
- Settings page that documents future backend integration
- Responsive sidebar and mobile layout

## Run locally

Requirements: Node.js and npm installed.

```bash
cd it-cell-incharge-dashboard
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

To test a production build:

```bash
npm run build
```

## Important

- All names, tickets, assets, dates, and counts shown are **sample/demo data**.
- Data is held in React state. It resets on refresh and is not sent to a server.
- No login/authentication is implemented; this is intentional for the local prototype.
- No real employee or asset information should be entered into this demo.
- Backend integration can later replace the local state with API calls and add server-side role/permission checks.

## Suggested integration path later

1. Confirm the role name and permissions with the backend team.
2. Add the dashboard route to the existing app router.
3. Protect it with the team's authenticated role route.
4. Replace local ticket/asset state with API services.
5. Add server-side validation, audit logs, and permissions.
6. Add loading, empty, and API error states.

Keep this folder isolated until the team agrees how it should be merged into the main client.
