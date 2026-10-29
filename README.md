# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## E.T. Operations deployment

The Operations frontend is a separate production build served from the root of `ops.etcustomlandscaping.com`:

```powershell
npm run build:ops
```

Upload the generated `dist` directory to the Operations Cloudflare Pages project. Keep these Cloudflare environment variables configured:

- `OPERATIONS_APPS_SCRIPT_URL` — the existing Apps Script `/exec` URL
- `OPERATIONS_API_SHARED_SECRET` — the same secret stored in Apps Script

The main customer website still uses `npm run build`.

### One-time live-route/history migration

The backend update adds two sheets and appends fields to three existing sheets. Do not add them by hand. After replacing `backend/operations-apps-script/Code.gs` in Apps Script, run:

1. `migrateOperationsForAbortAndHistoryRemoval()` once. This includes the earlier live-route/history migration, creates `History Removals`, and updates status validation lists without deleting records.
2. `verifyOperationsSetup()` once.

The migration creates:

- `Daily Services` — one canonical service job per service date and reusable Stop ID, preventing shared Stops from being double-counted.
- `Daily Service Participants` — participating runs and their crew counts/join/leave times.
- `History Removals` — administrator-only soft-removal metadata (record type, ID, reason, user, and time).

It appends:

- `Run Stops`: `Daily Service ID`, `Shared`
- `Stop Work Segments`: `Daily Service ID`, `Crew Count`
- `Stop Pauses`: `Daily Service ID`

Existing records are preserved and backfilled as independent historical daily services. The migration is safe to rerun because already-linked Run Stops are skipped.

After verification, publish a new version of the existing Apps Script web-app deployment (`Deploy → Manage deployments → Edit → New version → Deploy`). This preserves the `/exec` URL. No new Script Properties are required.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
