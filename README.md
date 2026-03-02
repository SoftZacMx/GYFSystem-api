# Files Manager API

Backend REST API for **Files Manager**: documents, students, users, events, notifications, and companies. Built with TypeScript, Express, TypeORM, and MySQL. Follows MVC and SOLID; JWT auth, Zod validation, S3-compatible storage.

## Requirements

- **Node.js** 18+ (LTS)
- **MySQL** 8.x (e.g. via Docker)
- **AWS S3** or S3-compatible storage (optional for file uploads)

## Quick start

1. **Environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database and optional S3/SMTP/JWT settings.

2. **Database**

   Start MySQL (example with Docker):

   ```bash
   docker compose up -d
   ```

   Then run migrations:

   ```bash
   npm run migration:run
   ```

   Optionally seed data:

   ```bash
   npm run seed
   ```

3. **JWT keys (optional)**

   For signing/verification beyond default dev secret:

   ```bash
   npm run generate-keys
   ```

4. **Run**

   ```bash
   npm install
   npm run dev
   ```

   API: `http://localhost:3000` (or `PORT` from `.env`).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with watch (tsx) |
| `npm start` | Run compiled app (run `npm run build` first) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run migration:run` | Run pending TypeORM migrations |
| `npm run seed` | Seed database |
| `npm run generate-keys` | Generate RSA key pair under `./keys/` |

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `development` \| `production` \| `test` | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection | `localhost`, `3306`, `root`, `""`, `files_manager` |
| `JWT_SECRET` | Secret for JWT (min 32 chars in production) | `dev-secret-do-not-use-in-production` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | S3 / object storage | — |
| `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE` | Optional (e.g. MinIO) | — |
| `SIGNATURE_PRIVATE_KEY_PATH`, `SIGNATURE_PUBLIC_KEY_PATH` | Paths to RSA keys | `./keys/private.pem`, `./keys/public.pem` |
| `APP_URL` | Base URL of the API | `http://localhost:3000` |
| `SMTP_*` | Mail (host, port, user, pass, from) | Optional |

See `.env.example` in the repo for a full template.

## API overview

- **Auth:** JWT in `Authorization: Bearer <token>`. Login returns a token; use it for protected routes.
- **Pagination:** `?page=1&limit=20` (defaults); list responses include `meta.page`, `meta.limit`, `meta.total`, `meta.totalPages`.
- **Sorting:** `?sortBy=<field>&order=asc|desc` (validated per resource).
- **Responses:** Success: `{ success: true, data, meta }`. Error: `{ success: false, error: { message, code, details? } }`. Standard codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, etc.

### Endpoints

- **Health:** `GET /`, `GET /health`, `GET /readiness` (DB check).
- **Docs:** `GET /api-docs` (Swagger UI).
- **Auth:** login, register (if implemented), refresh (if implemented).
- **Resources:** users, user-types, roles, students, parent-students, document-categories, documents, events, notifications, company.

## Project structure

```
src/
├── config/          # Env, DB, OpenAPI, S3
├── entities/        # TypeORM entities
├── repositories/    # Data access (interfaces + implementations)
├── services/        # Business logic
├── controllers/     # HTTP handlers (thin)
├── views/           # Response serialization / helpers
├── middlewares/     # Auth, roles, global error handler, logging
├── routes/          # Route definitions
├── validators/      # Zod schemas
├── migrations/      # TypeORM migrations
└── index.ts         # App entry
```

## Docker (MySQL only)

```bash
docker compose up -d
```

Starts MySQL 8 with a persistent volume. Configure `DB_*` in `.env` to match.

## Documentation

- **Backend spec:** `docs/backend-creation-prompt.md` (data model, API format, auth, errors, stack).
