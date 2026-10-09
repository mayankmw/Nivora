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
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/v1
- Health check: http://localhost:3000/api/v1/health

The frontend dev server proxies `/api` to the backend, so the browser only talks to port 5173.

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
