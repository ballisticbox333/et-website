# E.T. Operations backend

This directory contains the Google Apps Script API used by the separate Operations frontend at `https://ops.etcustomlandscaping.com/`.

The browser never reads Google Sheets. Its production request path is:

`Operations PWA → /api/operations on Cloudflare → Apps Script Web App → E.T. Operations spreadsheet`

Cloudflare adds the server-only shared secret before forwarding a request. The frontend receives domain objects and never receives password hashes, session hashes, or raw Sheet rows.

## Files

- `Code.gs` — API dispatcher, authentication, sessions, permissions, sheet mapping, routes/stops/runs, timing, issues, mutation replay, auditing, and first-admin bootstrap.
- `appsscript.json` — Apps Script timezone/runtime and web-app configuration.

The supplied `ET_Overall_Route_Sync_Rewrite.gs` remains part of the separate Overall spreadsheet synchronization. It copies the raw Truck value into `Property Sync` and excludes Price. It is not the Operations API.

## Security model

- Passwords are PBKDF2-HMAC-SHA-256 hashed with an individual random salt. Only the encoded hash is stored.
- A usable session token is returned once to the client. Only its SHA-256 hash is stored in `Sessions`.
- Session version is encoded in the token and compared to the current `Users → Session Version` value.
- Password resets increment the session version and revoke existing session rows.
- The Cloudflare Worker and Apps Script share `API_SHARED_SECRET`. It must never use a `VITE_` prefix or appear in browser code.
- Every mutation is serialized through `LockService`, recorded in `Mutation Log`, and replayed rather than re-executed when its Mutation ID is seen again.
- The frontend stores its usable session token in localStorage because Apps Script cannot issue an HttpOnly cookie for the separate Cloudflare domain. This enables long-lived PWA login but means an XSS vulnerability could read the token. Keep third-party scripts out of the Operations site, retain a strict Content Security Policy when Cloudflare headers are configured, and revoke sessions after a suspected device compromise.

## Production frontend

Run:

```powershell
npm run build:ops
```

This builds an Operations-only `dist/index.html`. In this mode:

- the app lives at `/`, not `/ops`;
- internal URLs are `/routes`, `/start`, `/run/<id>`, `/issues`, `/machines`, and `/users`;
- the manifest has `start_url` and `scope` set to `/`;
- the service worker is `/sw.js` with root scope;
- the API defaults to same-origin `/api/operations`;
- real API mode is the default;
- mock mode is not enabled automatically after an API failure.

The ordinary `npm run dev` build still permits the convenient local `/ops` path. `npm run dev:ops` runs the Operations-only entry at localhost root.

# MANUAL STEPS FOR JOHN

1. Open the existing **E.T. Operations** Google Sheet and confirm its ID is `1l_YSkxPa2c4JrEXcH0jeXm-DwepUjrxbQwPbBxGn2ms`.

2. Confirm every required tab and its first-row headers exactly match the handoff. Do not add `Run Crew`, `Run Stop Crew`, or a Price column. The API intentionally stops with a clear error when a required header does not match.

3. Create a new **standalone Apps Script project** at `script.google.com`. Name it `E.T. Operations API`. A standalone project keeps the backend separate from the Overall synchronization script.

4. Replace the default Apps Script code with the complete contents of `backend/operations-apps-script/Code.gs`.

5. In Apps Script, open **Project Settings**, enable **Show "appsscript.json" manifest file in editor**, then replace its contents with `backend/operations-apps-script/appsscript.json`.

6. In **Project Settings → Script Properties**, create:

   - `SPREADSHEET_ID` = `1l_YSkxPa2c4JrEXcH0jeXm-DwepUjrxbQwPbBxGn2ms`
   - `API_SHARED_SECRET` = a newly generated random secret of at least 32 characters

   Generate the secret with a password manager. Do not use an employee password and do not paste it into frontend source code.

7. Temporarily add these Script Properties for the first administrator:

   - `BOOTSTRAP_ADMIN_NAME` = the administrator's display name
   - `BOOTSTRAP_ADMIN_USERNAME` = the desired login username
   - `BOOTSTRAP_ADMIN_PASSWORD` = a unique temporary password containing at least 12 characters

8. In the Apps Script editor, select `verifyOperationsSetup` and click **Run**. Google will ask for permission to view and edit spreadsheets used by the script and to manage the script's own properties. Choose your Google account, review the warning, and authorize it. This function checks every tab and header without creating operational records.

9. Fix any exact missing-tab or header error reported by `verifyOperationsSetup`, then run it again until the execution log says all tabs and headers were verified.

10. Select `bootstrapFirstAdmin` and click **Run** once. It creates the first active administrator using a salted password hash. It automatically deletes the three `BOOTSTRAP_ADMIN_*` properties afterward. Confirm the new row in `Users`; `Password Hash` should contain an encoded value beginning with `pbkdf2-sha256$`, not the password.

11. In Apps Script choose **Deploy → New deployment → Web app**.

12. Set **Execute as** to **Me**. Set **Who has access** to **Anyone**. This is necessary because Cloudflare is the caller and cannot sign into a Google account. The Web App is still protected by the long `API_SHARED_SECRET`, which Cloudflare adds server-side.

13. Deploy, authorize if asked, and copy the URL ending in `/exec`. Do not use the `/dev` test URL.

14. In the Cloudflare Pages project that will serve `ops.etcustomlandscaping.com`, open **Settings → Variables and Secrets** and add encrypted secrets:

   - `OPERATIONS_APPS_SCRIPT_URL` = the copied `/exec` URL
   - `OPERATIONS_API_SHARED_SECRET` = exactly the same value used in Apps Script

   These names must not start with `VITE_`; otherwise they could be embedded in browser JavaScript.

15. For local testing through Vite, create `.env.local` in the website project. It is ignored by Git. Add the same two server-only values:

   ```text
   OPERATIONS_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   OPERATIONS_API_SHARED_SECRET=YOUR_SHARED_SECRET
   ```

   The local Vite middleware adds the secret. Do not add a `VITE_OPERATIONS_USE_MOCKS` value when testing real data.

16. Run `npm run dev:ops`, then open the localhost URL shown by Vite. The Operations app should appear at `/`, matching the future subdomain behavior.

17. Sign in using the administrator account created by `bootstrapFirstAdmin`. An incorrect password must show a login failure. The old preview behavior where any password worked is disabled unless mock mode is deliberately enabled.

18. Open **Users** in the administrator navigation. Create Tyler and John with unique temporary passwords and the appropriate Route Leader/Admin checkboxes. Give each password directly to the correct person. Do not email a shared password list.

19. Test a complete real workflow:

   - confirm live `Property Sync` properties appear and Truck values such as `1`, `2`, or `12` display exactly as stored;
   - create a reusable Stop and confirm rows appear in `Stops` and `Stop Properties`;
   - create a Route and confirm rows appear in `Routes` and `Route Stops`;
   - start a Route Run and confirm rows appear in `Route Runs` and `Run Stops`;
   - Arrive, Start Work, Pause, Resume, Complete, and Depart;
   - verify `Stop Work Segments` and `Stop Pauses` contain separate records and paused time is excluded from `Active Work Minutes`;
   - report and resolve one test Property Issue and one test Machine Issue;
   - check `Mutation Log` and `Audit Log`.

20. Test session invalidation from **Users** using **Log out all devices**. Test **Reset password** and confirm the old password and existing sessions stop working.

21. Run `npm run lint`, `npm run build`, and `npm run build:ops`. Upload the `dist` produced by the final `npm run build:ops` command to the separate Cloudflare Pages Operations project. Do not upload a normal `npm run build` artifact to the Operations project.

22. In that Operations Cloudflare Pages project, add the custom domain `ops.etcustomlandscaping.com`. Because the domain's DNS is already managed by Cloudflare, allow Pages to create the required DNS record. The Operations project is separate from the main `etcustomlandscaping.com` Pages project.

23. Visit `https://ops.etcustomlandscaping.com/`, confirm the login screen loads at the root, and verify the Network request for login goes to `https://ops.etcustomlandscaping.com/api/operations` rather than directly to Google.

24. When backend code changes later, edit `Code.gs`, save it, then choose **Deploy → Manage deployments → Edit**, select **New version**, and deploy. The existing `/exec` URL normally remains the same. If you create an entirely new deployment URL, update `OPERATIONS_APPS_SCRIPT_URL` in Cloudflare and `.env.local`.

After deploying backend action changes, send `{"action":"getApiInfo","payload":{}}` as a POST to `https://ops.etcustomlandscaping.com/api/operations`. The response identifies the deployed API version and its `supportedMutations`; use it to confirm that `abortStop` and `abortRoute` are live before testing a real Run Stop.

25. If a device is lost or a session may be exposed, use **Log out all devices** for that user. A password reset also revokes their sessions.

## Optional explicit mock mode

Mocks remain available only for isolated visual work. To enable them locally, create `.env.development.local` containing:

```text
VITE_OPERATIONS_USE_MOCKS=true
```

Delete that file when testing the real backend. Never set `VITE_OPERATIONS_USE_MOCKS=true` in Cloudflare production variables.

## Live Routes, shared daily Stops, History, and recaps migration

This update is additive. It adds:

- `Daily Services` — one canonical service job per Service Date + reusable Stop ID.
- `Daily Service Participants` — participating Route Runs and their crew counts.
- `Run Stops`: `Daily Service ID`, `Shared`.
- `Stop Work Segments`: `Daily Service ID`, `Crew Count`.
- `Stop Pauses`: `Daily Service ID`.

Do not add these manually. After replacing `Code.gs`, run `migrateOperationsForAbortAndHistoryRemoval` once from the Apps Script editor. It includes the earlier live-route migration, creates the `History Removals` tab, updates the status validation lists, and backfills existing Run Stops without deleting or repurposing historical rows. Existing historical Run Stops are intentionally backfilled as separate daily services because the old data did not record whether work was truly shared.

After migration, run `verifyOperationsSetup`, then deploy a new version through **Deploy → Manage deployments → Edit → New version → Deploy**. The existing `/exec` URL remains unchanged.

Mixed-crew shared Stop efficiency uses a duration-weighted baseline across the stored work segments. For example, a service with time at two crew members and later four crew members retains both segments; it is not forced into a single crew-count average.

## Normal administrator cleanup

Testing uses the same data model as production. There is no test flag, test mode, or bulk test-data action.

To remove an unwanted run, use **History → Removed → Remove a record from History**, choose `Route Run`, and enter a required reason. The soft-removal cascades through the run's Stops, work/pause timing, route downtime, travel/delays, issues, participants, completion events, and eligible Daily Service. Shared Daily Services remain when another visible run still depends on them. Removed records affect neither normal History nor analytics but remain visible in the administrator-only Removed and Audit areas.

Reusable Routes and Stops are archived from **Route Library**. An archived template may be permanently deleted only through its confirmation dialog and only when the backend finds no legitimate historical dependencies. Permanent deletion removes template relationships, never Properties, historical records, or unrelated Stops.

The migration removes the obsolete trailing `Test Batch ID` columns from Stops, Routes, and Route Runs if they were created by an earlier local build. It also creates the `Run Pauses` and `Stop Completion Events` tabs and refreshes controlled validation values.
