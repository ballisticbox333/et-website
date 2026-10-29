# Employee Review Portal deployment

The complete Apps Script source is `ET_Employee_Review_Backend.gs`. It preserves the existing publishing/archive workflow and adds only the read-only employee portal endpoint.

## Apps Script property

Create exactly this Script Property:

- `REVIEW_API_SECRET`: a long random secret shared only with Cloudflare.

Do not place the secret in source code or browser code.

## Cloudflare Pages variables

Create these encrypted production secrets for the Pages project:

- `REVIEW_APPS_SCRIPT_URL`: the deployed Apps Script `/exec` URL for the employee review backend.
- `REVIEW_API_SECRET`: the exact same value stored in Apps Script Script Properties.

The Pages advanced-mode worker in `public/_worker.js` proxies `/api/reviews/<access-code>` to Apps Script. The browser never receives either secret.

## Apps Script deployment

1. Open the Apps Script project bound to `E.T. Employee Review System`.
2. Replace the current code with `ET_Employee_Review_Backend.gs`.
3. Open **Project Settings** and add the `REVIEW_API_SECRET` Script Property.
4. Run `setupReviewSystem` once and confirm it completes normally.
5. Select **Deploy → New deployment → Web app**. For an existing web app, select **Deploy → Manage deployments → Edit → New version**.
6. Set **Execute as** to **Me** and **Who has access** to **Anyone**. The endpoint remains protected by the shared secret and only returns allowlisted employee data.
7. Copy the resulting `/exec` URL into Cloudflare as `REVIEW_APPS_SCRIPT_URL`.

## Cloudflare deployment

1. Build the Vite project with `npm run build`.
2. Upload the contents of `dist` to the existing Cloudflare Pages project.
3. In the Pages project settings, add both encrypted production secrets listed above.
4. Redeploy after saving the secrets.

The upload must include `_worker.js` and `_routes.json`; otherwise the same-origin API will not exist.
