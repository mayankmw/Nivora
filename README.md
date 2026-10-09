# Nivora

A multi-tenant student hostel management platform: admissions, bed allocation, fees, complaints, leave, visitors and notices for hostel owners, wardens, accountants and students.

- [docs/requirements.md](docs/requirements.md): what the product does.
- [docs/architecture.md](docs/architecture.md): how it is built, and the decisions behind it.

## Structure

```text
nivora/
├── frontend/   React + Vite + TypeScript
├── backend/    NestJS + TypeScript
└── docs/
```

## Prerequisites

- Node.js 24 or newer (npm is included).

## Getting started

```bash
npm install
cp backend/.env.example backend/.env
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/v1
- Health check: http://localhost:3000/api/v1/health

The frontend dev server proxies `/api` to the backend, so the browser only talks to port 5173.

## Backend environment

The backend reads its settings from `backend/.env`, which is not committed. `backend/.env.example` lists every variable. The API refuses to start if a value is invalid and prints what to fix.

| Variable       | Default                 | Meaning                                                                |
| -------------- | ----------------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`     | `development`           | `development`, `test` or `production`                                  |
| `PORT`         | `3000`                  | Port the API listens on                                                |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated browser origins allowed to call the API                |
| `LOG_LEVEL`    | `log`                   | Most verbose level printed: `error`, `warn`, `log`, `debug`, `verbose` |

## API responses

Every endpoint answers in one of two shapes, and every response carries an `x-request-id` header.

```json
{ "data": { "status": "ok" } }
```

```json
{
  "error": { "code": "VALIDATION_FAILED", "message": "Request validation failed", "details": [] },
  "requestId": "7f561bf1-e1e8-40dd-904e-62dae8c46cd5"
}
```

## Scripts

Run from the repo root.

| Command                | What it does                           |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Run frontend and backend in watch mode |
| `npm run dev:frontend` | Run only the frontend                  |
| `npm run dev:backend`  | Run only the backend                   |
| `npm run build`        | Production build of both apps          |
| `npm run lint`         | Lint both apps with oxlint             |
| `npm run typecheck`    | Type-check both apps                   |
| `npm test`             | Backend unit tests                     |
| `npm run test:e2e`     | Backend end-to-end tests               |
| `npm run format`       | Format the repo with Prettier          |
