# Files Manager API — Initialization Guide

This document is for **AI agents** and **developers** to configure and deploy the project from scratch. Follow the steps in order.

---

## Purpose

- **Project:** Backend REST API for Files Manager (documents, students, users, events, notifications, companies).
- **Stack:** Node.js, TypeScript, Express, TypeORM, MySQL, JWT, Zod, S3-compatible storage (e.g. MinIO/AWS S3).
- **Goal:** Get the API running locally and prepare for deployment.

---

## Prerequisites

- **Node.js** 18+ (LTS).
- **MySQL 8** (local or Docker).
- **npm** (or compatible package manager).
- Optional: **Docker** and **Docker Compose** for MySQL and MinIO.

---

## Step-by-step setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

- Copy the example file: `cp .env.example .env`
- Edit `.env` with real values. Minimum for local run:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — must match your MySQL instance.
  - `JWT_SECRET` — in production use a long secret (≥ 32 characters).
  - `CORS_ORIGIN` — in production set to the frontend origin (e.g. `https://app.example.com`).

**Full env reference** (see also `src/config/env.ts`):

| Variable | Required | Default | Notes |
|----------|----------|---------|--------|
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `PORT` | No | `3000` | Server port |
| `DB_HOST` | No | `localhost` | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_USER` | No | `root` | MySQL user |
| `DB_PASSWORD` | No | `''` | MySQL password |
| `DB_NAME` | No | `files_manager` | MySQL database name |
| `JWT_SECRET` | Yes in prod | dev default | Min 32 chars in production |
| `CORS_ORIGIN` | No | `*` | Allowed origin for CORS |
| `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | For uploads | — | Use with MinIO or AWS S3 |
| `S3_ENDPOINT` | Optional | — | e.g. `http://localhost:9000` for MinIO |
| `S3_FORCE_PATH_STYLE` | No | `false` | Set `true` for MinIO |
| `SIGNATURE_PRIVATE_KEY_PATH`, `SIGNATURE_PUBLIC_KEY_PATH` | No | `./keys/private.pem`, `./keys/public.pem` | RSA keys for signatures |
| `APP_URL` | No | `http://localhost:3000` | Base URL of the API |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | For email | — | Optional |

### 3. Database (MySQL)

**Option A — Docker Compose (recommended for local)**

From the project root (where `docker-compose.yml` is):

```bash
docker compose up -d
```

This starts MySQL and MinIO. Ensure `.env` matches the compose defaults (e.g. `DB_USER`, `DB_PASSWORD`, `DB_NAME` as in `.env.example`).

**Option B — Existing MySQL**

Create a database named `files_manager` (or your `DB_NAME`) and set `DB_*` in `.env` accordingly.

### 4. Run migrations

```bash
npm run migration:run
```

Must run after MySQL is up and `.env` is set. Creates/updates schema.

### 5. Seed (optional)

To load initial data (roles, user types, etc.):

```bash
npm run seed
```

### 6. RSA keys for signatures (optional)

If the app uses document/signature features:

```bash
npm run generate-keys
```

This creates `./keys/private.pem` and `./keys/public.pem`. Override paths with `SIGNATURE_PRIVATE_KEY_PATH` and `SIGNATURE_PUBLIC_KEY_PATH` if needed.

### 7. Run the API

**Development (watch):**

```bash
npm run dev
```

**Production (build first):**

```bash
npm run build
npm start
```

Server listens on `PORT` (default 3000). Health: `GET /`, `GET /health`, `GET /readiness`. Docs: `GET /api-docs`.

---

## Optional: S3-compatible storage (MinIO)

If using Docker Compose, MinIO is already started. Create a bucket (e.g. `files-manager-dev`) and set in `.env`:

- `S3_REGION=us-east-1`
- `S3_BUCKET=files-manager-dev`
- `S3_ACCESS_KEY_ID=minioadmin`
- `S3_SECRET_ACCESS_KEY=minioadmin`
- `S3_ENDPOINT=http://localhost:9000`
- `S3_FORCE_PATH_STYLE=true`

---

## Scripts reference

| Script | Description |
|--------|--------------|
| `npm run dev` | Start dev server with watch |
| `npm start` | Start app (after build) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run migration:run` | Run TypeORM migrations |
| `npm run seed` | Seed database |
| `npm run generate-keys` | Generate RSA key pair in `./keys/` |

---

## Deployment checklist

1. Set `NODE_ENV=production`.
2. Use a strong `JWT_SECRET` (≥ 32 characters).
3. Set `CORS_ORIGIN` to the frontend URL.
4. Use a dedicated MySQL instance and secure `DB_*` credentials.
5. Use a real S3 bucket and credentials; do not rely on dev defaults in production.
6. Run migrations on the production DB before or during deploy.
7. Serve the app with a process manager (e.g. PM2) or a container; expose only `PORT`.

---

## Troubleshooting

- **"Invalid environment" on start:** Check `.env` matches the schema in `src/config/env.ts` (Zod validation). Fix or add missing variables.
- **DB connection failed:** Ensure MySQL is running and `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` are correct. Run `npm run migration:run` after DB is ready.
- **401 on protected routes:** Ensure the client sends `Authorization: Bearer <token>` with a valid JWT (obtain via login endpoint).

---

## Related docs

- **Backend spec and data model:** `docs/backend-creation-prompt.md`
- **README:** `../README.md`
