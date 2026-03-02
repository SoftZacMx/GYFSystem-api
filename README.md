# Files Manager API

Backend API for Files Manager (documents, students, users). TypeScript, Express, TypeORM, MySQL.

## Setup

1. Copy environment variables: `cp .env.example .env` and adjust if needed.
2. Start MySQL (Docker): `docker compose up -d` — runs only the MySQL service on port 3306.
3. Install dependencies: `npm install`.
4. Run the API: `npm run dev` (development) or `npm start` (production build with `npm run build` first).

## Scripts

- `npm run dev` — development with watch
- `npm start` — run with tsx (or run `node dist/index.js` after build)
- `npm run build` — compile TypeScript to `dist/`
- `npm run migration:run` — run pending TypeORM migrations (requires MySQL up and `.env` configured)

## Docker (MySQL only)

To run only the database:

```bash
docker compose up -d
```

This starts MySQL 8 with a persistent volume. The API connects using `DB_*` env vars (see `.env.example`).
