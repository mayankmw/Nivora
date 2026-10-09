# Nivora

Multi-tenant student hostel management SaaS. Built incrementally with the owner, one small step at a time.

## Read first

- [docs/requirements.md](docs/requirements.md): what the product must do (roles, modules, fields, workflows, dashboards, the 20 development rules).
- [docs/architecture.md](docs/architecture.md): the approved architecture and the decisions log. Read it before designing or implementing anything.

## Current status

Work happens on the `development` branch.

- Step 1 (workspace scaffold) is done: npm workspaces with a Vite + React `frontend`, a NestJS `backend` exposing `GET /api/v1/health`, and shared formatting, lint, typecheck, test and build scripts.
- Step 2 (frontend foundation) is done: Tailwind CSS 4, Shadcn UI, React Router, Zustand and TanStack Query are wired up, with an app shell (collapsible sidebar, header with breadcrumb, light/dark/system theme, mobile drawer). Every sidebar entry routes to a placeholder page.
- Not yet built: backend environment configuration, Docker Postgres, Prisma, error handling and logging, the API client, authentication, and every feature module.

Update this section as steps are completed.

## How to work

- **Wait for approval.** Do not start a step, write code or create files until the owner explicitly asks for it. A discussion or an answered question is not a go-ahead.
- **One small step at a time.** Each step should fit in one Git commit. Never generate large parts of the app at once.
- **Do not change approved decisions silently.** If something in the decisions log needs to change, explain why and get agreement first.
- **Recommend packages before installing them.**
- **Give complete files with exact paths**, not disconnected snippets.
- **Skip the basics.** The owner is comfortable with React, Node.js, NestJS, databases, Zustand, Tailwind and Shadcn UI. Explain architecture and trade-offs, not fundamentals.
- **Explain unfamiliar architecture terms in plain language** when proposing them (for example row-level security or tenant-scoped clients).

## Milestone report

End every completed step with:

```text
What we built
Files created/changed
Database changes
APIs added
How to test
Expected result
Suggested Git commit
```

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Shadcn UI, Zustand, React Router, TanStack Query, Recharts, Framer Motion.
- Backend: NestJS, TypeScript, PostgreSQL, Prisma. Modular monolith, no microservices.
- Realtime: Socket.IO. Payments: Razorpay. Files: local disk now, S3-compatible later.
- Monorepo: npm workspaces with `frontend` and `backend` (no pnpm); `packages/shared` is added when first needed.
- Tooling: oxlint for linting, Vitest for tests, Prettier for formatting (config at the repo root).
- Shadcn UI: add components from the `frontend` folder with `npx shadcn@latest add <name>`, then run `npm run format`. Files in `frontend/src/components/ui` are generated.
- Local: frontend `http://localhost:5173`, backend `http://localhost:3000`, PostgreSQL in Docker on `localhost:5432`.

## Commands

Run from the repo root. Requires Node 24 or newer.

```text
npm install          install dependencies
npm run dev          run frontend (5173) and backend (3000) together
npm run lint         oxlint in both apps
npm run typecheck    TypeScript in both apps
npm test             backend unit tests
npm run test:e2e     backend e2e tests
npm run build        production build of both apps
npm run format       Prettier write; npm run format:check to verify
```

Install a package into one app with `npm install <pkg> --workspace @nivora/frontend` (or `@nivora/backend`).

## Non-negotiables

- Never accept an organization ID from the client. Derive it from the authenticated session.
- Every tenant-owned table carries `organizationId`; all access goes through the tenant-scoped Prisma client.
- Business logic lives in services, not controllers. Validate all input with DTOs.
- Use transactions for allocation and financial operations.
- Money is stored as integer paise. Financial records are never deleted or edited after issue.
- Never store plaintext passwords or card data. Never serve documents from a public path.
- Secrets come from environment variables; keep `.env.example` current and never commit `.env`.
