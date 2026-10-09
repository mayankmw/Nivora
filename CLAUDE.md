# Nivora

Multi-tenant student hostel management SaaS. Built incrementally with the owner, one small step at a time.

## Read first

- [docs/requirements.md](docs/requirements.md): what the product must do (roles, modules, fields, workflows, dashboards, the 20 development rules).
- [docs/architecture.md](docs/architecture.md): the approved architecture and the decisions log. Read it before designing or implementing anything.

## Current status

Architecture approved on 2026-10-09. No code exists yet. Next is Phase 1, Step 1 (workspace scaffold), which starts only when the owner sends the Step 1 prompt. Update this section as steps are completed.

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
- Monorepo: pnpm workspace with `apps/api`, `apps/web`, `packages/shared`.
- Local: frontend `http://localhost:5173`, backend `http://localhost:3000`, PostgreSQL in Docker on `localhost:5432`.

## Non-negotiables

- Never accept an organization ID from the client. Derive it from the authenticated session.
- Every tenant-owned table carries `organizationId`; all access goes through the tenant-scoped Prisma client.
- Business logic lives in services, not controllers. Validate all input with DTOs.
- Use transactions for allocation and financial operations.
- Money is stored as integer paise. Financial records are never deleted or edited after issue.
- Never store plaintext passwords or card data. Never serve documents from a public path.
- Secrets come from environment variables; keep `.env.example` current and never commit `.env`.
