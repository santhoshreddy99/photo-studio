# Photo Studio — SendGrid credential emails

This small scaffolding implements server-side credential email sending using SendGrid and a protected API route.

## Setup

1. Copy `.env.example` to `.env.local` and set the secrets:

   - SENDGRID_API_KEY
   - SENDGRID_SENDER
   - APP_URL
   - ADMIN_SECRET

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run dev server:

   ```bash
   npm run dev
   ```

4. Send a request (server-to-server) to create an account email:

   ```bash
   curl -X POST "${APP_URL:-http://localhost:3000}/api/send-credentials" \
     -H "Content-Type: application/json" \
     -H "x-admin-secret: $ADMIN_SECRET" \
     -d '{"to":"customer@example.com","name":"Jane Doe","tempPassword":"TempP@ssw0rd"}'
   ```

> Note: Always call `/api/send-credentials` from the server side or from an authenticated admin UI. Keep `ADMIN_SECRET` private.
## Admin login (NextAuth) ✅

This project now includes an admin login powered by NextAuth using a credentials provider. Configure the following env vars in `.env.local`:

- `NEXTAUTH_URL` - e.g. `http://localhost:3000`
- `NEXTAUTH_SECRET` - a strong random value
- `ADMIN_EMAIL` - e.g. `admin@yourdomain.com`
- `ADMIN_PASSWORD` - a secure password for the admin

Start the app and visit:

- `http://localhost:3000/admin/login` — admin sign-in page
- `http://localhost:3000/admin` — protected admin console (redirects to sign-in if unauthenticated)

## Cloudflare R2 upload flow

This project includes a simple presigned upload flow for Cloudflare R2:

- `POST /api/upload/presign` — (admin only) request a presigned PUT URL for an object. Body: `{ filename, contentType, userEmail }`.
- Client uploads file directly with a PUT to the presigned URL.
- `POST /api/admin/complete-upload` — (admin only) notify the server of a completed upload. Body: `{ key, filename, contentType, size, userEmail }`. The server records metadata in `data/photos.json` and runs a synchronous thumbnail/webp processing step (demo).
- `GET /api/download?key=...` — request a temporary signed GET URL for private downloads.

Configure these env vars in `.env.local`:

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` (e.g. `https://<accountid>.r2.cloudflarestorage.com`).

Note: For production, process uploads asynchronously (R2 Bucket notification → Worker/Function) and store metadata in a proper DB (Postgres + Prisma).
