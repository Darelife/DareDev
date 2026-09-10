# DareDev

Prakhar Bhandari's personal site: portfolio, blog, learning resources, and a
private Excalidraw canvas — all editable through an authenticated admin
panel.

## Structure

npm workspaces monorepo, independently deployable frontend and backend:

```
apps/web       Next.js frontend (public site + /admin panel)
apps/api       Next.js backend (route handlers only, no pages)
packages/shared  Types shared by both apps
db/            Neon (Postgres) schema.sql and Firestore security rules
scripts/       One-off ops scripts (seed-admin.ts)
```

Data is split by shape:

- **Neon (Postgres)** — relational content: users, projects, resources, blog
  post metadata.
- **Firebase (Firestore)** — document content: the canvas scene, blog post
  bodies. Only `apps/api` talks to Firestore, via the `firebase-admin` SDK.
  There is no client-side Firebase SDK anywhere in this repo.

## Getting started

```bash
npm install

cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
# fill in DATABASE_URL, FIREBASE_SERVICE_ACCOUNT, JWT_SECRET, FRONTEND_ORIGIN

psql "$DATABASE_URL" -f db/schema.sql
# deploy db/firestore.rules to your Firebase project

npm run seed-admin --workspace=apps/api -- <username> <password>

npm run dev
# apps/web on :3000, apps/api on :4000
```

The public site fetches from `apps/api`; the admin panel at `/admin` on
`apps/web` requires the seeded account to log in.

## Firebase task database

The task API uses two Firestore collections:

- `tasks`: `content`, `type` (`planned` or `actual`), `taskDate` (`YYYY-MM-DD`), `taskTime` (`HH:mm`), `createdAt`
- `deadlines`: `content`, `targetDate` (`YYYY-MM-DD`), `targetTime` (`HH:mm`), `createdAt`

All endpoints require the existing admin session:

```text
GET/POST     /api/admin/tasks
PATCH/DELETE /api/admin/tasks/:id
GET/POST     /api/admin/deadlines
PATCH/DELETE /api/admin/deadlines/:id
```

To create the Firebase side once:

1. Open the [Firebase console](https://console.firebase.google.com/), create or select a project, and create a Firestore database. Production mode is appropriate because the API uses the Admin SDK.
2. In **Project settings → Service accounts**, generate a private key. Keep the downloaded JSON outside git.
3. Base64-encode that file and put the result in `apps/api/.env.local`:

   ```bash
   base64 -w0 /path/to/service-account.json
   ```

   Set the command output as `FIREBASE_SERVICE_ACCOUNT`.
4. Deploy `db/firestore.rules` with the Firebase CLI (`firebase login`, `firebase use <project-id>`, then `firebase deploy --only firestore:rules`). These rules intentionally deny direct browser access; only the server API should access task data.
5. Set `DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT`, `JWT_SECRET`, and `FRONTEND_ORIGIN` in the environment used by `apps/api`. Never commit the service-account JSON or its base64 value.

The repository now has the database/API foundation, but no task page in `apps/web`; a task screen can call these endpoints through the existing `apiFetch` helper.
