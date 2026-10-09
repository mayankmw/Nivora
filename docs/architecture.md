# Nivora Architecture

Approved architecture for Nivora, a multi-tenant student hostel management platform. Product requirements are in [requirements.md](requirements.md). This document records how the system is built and why.

Status: architecture approved on 2026-10-09. Step 1 (workspace scaffold) is done; see [CLAUDE.md](../CLAUDE.md) for current progress.

## Decisions log

| #   | Decision                                                                                                                                                             | Reason                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The project is named **Nivora** (an earlier draft of the brief said HostelOS).                                                                                       | Owner's choice.                                                                                                                          |
| 2   | `buildings`, `floors`, `rooms` and `beds` live inside one `hostels` NestJS module, each with its own controller and service.                                         | They form one aggregate with no independent lifecycle; four modules would import each other circularly.                                  |
| 3   | A separate `allocations` module owns bed assignment, transfer and release.                                                                                           | It is used by admissions, transfers and check-out, and is where race conditions occur.                                                   |
| 4   | One user belongs to exactly one organization and has exactly one role. Email is unique across the platform.                                                          | Simplest login and permission model. A person working for two organizations needs two accounts. Can migrate to a membership table later. |
| 5   | Tenant isolation is enforced in the application layer. PostgreSQL row-level security (RLS) is deferred.                                                              | RLS complicates Prisma connection handling. Every table carries `organizationId`, so RLS can be added later without redesign.            |
| 6   | PostgreSQL runs in Docker Compose for local development.                                                                                                             | Owner's choice.                                                                                                                          |
| 7   | npm workspaces monorepo, no pnpm, Turborepo or Nx.                                                                                                                   | Owner's choice (pnpm was used briefly in Step 1 and removed). npm ships with Node, so there is nothing extra to install.                 |
| 8   | No Redis, queue or microservices. Scheduled work uses `@nestjs/schedule` with idempotent jobs.                                                                       | Avoids infrastructure until there is more than one API instance.                                                                         |
| 9   | The apps live in top-level `frontend/` and `backend/` folders, not `apps/web` and `apps/api`. `packages/shared` is added when first needed.                          | Owner's Step 1 prompt asked for this layout.                                                                                             |
| 10  | Node 24 or newer is required (`engines` in the root `package.json`, `.nvmrc`).                                                                                       | The Nest 12 CLI crashes on Node 22.13.0; the owner upgraded the machine to Node 24.21.0.                                                 |
| 11  | Linting uses oxlint and tests use Vitest, in both apps.                                                                                                              | These are what the current Vite and Nest scaffolds generate; no reason to swap them.                                                     |
| 12  | Shadcn UI uses the Radix base with the Nova preset (neutral colours, Geist font, Lucide icons), on Tailwind CSS 4.                                                   | Radix is the API the owner already knows (`asChild`); Nova is the CLI's current default look.                                            |
| 13  | The sidebar and router are both generated from one config, `frontend/src/app/navigation.ts`.                                                                         | One place to add a module; role-based filtering attaches there when authentication lands.                                                |
| 14  | Logging uses Nest's built-in `ConsoleLogger`: readable lines in development, one JSON object per line in production. No pino or winston.                             | Enough for now and adds no dependency. Swap in pino if log volume or structured fields demand it.                                        |
| 15  | Environment variables are validated at startup with class-validator (`backend/src/config/env.validation.ts`); `appConfig` is the only code that reads `process.env`. | Reuses the validation library the DTOs already need, and a bad deployment fails immediately with a list of what to fix.                  |
| 16  | API versioning uses Nest's URI versioning with the global prefix `api` and default version `1`, giving `/api/v1/...`.                                                | A later breaking change can add `@Version('2')` to one handler without touching the rest.                                                |

Do not change these silently. If one needs to change, explain why and get approval first.

## 1. Product architecture

One React app, one API and one database serve three audiences:

| Surface          | Roles                            | Data scope                                                            |
| ---------------- | -------------------------------- | --------------------------------------------------------------------- |
| Platform console | SUPER_ADMIN                      | All organizations                                                     |
| Operations app   | HOSTEL_ADMIN, WARDEN, ACCOUNTANT | One organization; wardens and accountants limited to assigned hostels |
| Student portal   | STUDENT                          | Own records only                                                      |

The core object is the **stay**: admission → bed allocation → check-in → monthly billing → check-out → deposit settlement. Complaints, leave, outpass and visitors attach to a student with an active stay.

## 2. System architecture

```text
React SPA ──REST /api/v1──▶ NestJS modular monolith ──Prisma──▶ PostgreSQL (Docker)
    ▲                          ├─ domain events (in-process) ─▶ audit, notifications
    └──── Socket.IO ◀──────────┤─ scheduler ─▶ invoice generation, leave transitions
                               ├─ StorageService ─▶ local disk now, S3 later
Razorpay ──signed webhook─────▶└─ payments module
```

- WebSockets carry signals, not data. The server emits "complaint 42 changed" and the client refetches over REST, so permissions are enforced in one place.
- Modules use each other only through exported services or domain events, never by querying another module's tables.

Local addresses: frontend `http://localhost:5173`, backend `http://localhost:3000`, PostgreSQL `localhost:5432`.

## 3. Repository structure

```text
nivora/
├── frontend/             # React + Vite
├── backend/              # NestJS
├── packages/
│   └── shared/           # enums, permission keys, API types (no logic); added when first needed
├── docs/
├── docker-compose.yml    # Postgres; added with the database step
├── package.json          # npm workspaces and shared scripts
└── package-lock.json
```

`packages/shared` holds no logic and no validation. The backend validates with class-validator DTOs; the frontend uses zod with react-hook-form.

## 4. Frontend structure

```text
frontend/src/
├── app/           # app.tsx, providers, router, navigation config
│   ├── layouts/   #   AppLayout (sidebar + header + routed page)
│   └── pages/     #   cross-cutting pages: placeholder, not found
├── features/      # one folder per domain (auth, hostels, students, billing, complaints...)
│   └── <feature>/ #   api.ts · components/ · pages/ · schemas.ts
├── components/
│   ├── ui/        # shadcn primitives (generated; edit sparingly)
│   ├── layout/    # AppSidebar, AppHeader, AppBreadcrumb, ThemeToggle
│   └── shared/    # PageHeader, EmptyState; later DataTable, StatCard, CommandPalette
├── hooks/         # useThemeSync, useRouteTitle, useIsMobile
├── lib/           # query client, utils; later API client and socket client
└── stores/        # Zustand: theme, sidebar; later the auth session
```

- TanStack Query owns all server data. Zustand never caches API data.
- Features do not import from each other.

## 5. Backend structure

```text
backend/
├── prisma/               # schema, migrations, seed
├── .env.example          # every environment variable, documented
└── src/
    ├── main.ts           # bootstrap: logger, configureApp, listen
    ├── app.setup.ts      # prefix, versioning, CORS, middleware (shared with e2e tests)
    ├── config/           # env validation and the typed appConfig
    ├── common/           # CommonModule: validation pipe, response envelope, exception filter;
    │                     #   also errors, middleware, logging; later guards and decorators
    ├── health/           # GET /api/v1/health
    ├── infra/            # prisma, storage, audit, realtime
    └── modules/
        ├── auth · users · organizations
        ├── hostels       # hostels, buildings, floors, rooms, beds
        ├── allocations   # bed assignment, transfer, release
        ├── students · admissions
        ├── billing · payments
        ├── complaints · leave · outpass · visitors
        ├── notices · notifications
        └── mess · reports
```

Each module follows controller → service → Prisma. A repository class is added only where queries are complex (allocations, billing). No generic CRUD base classes.

## 6. Entities and relationships

The full Prisma schema is written incrementally, per phase. This is the intended model.

### Identity

- `Organization` is the tenant root; almost every other table points to it.
- `User` belongs to one organization and has one role. SUPER_ADMIN is the only user with no organization.
- `UserHostelAccess` links a warden or accountant to the hostels they may operate.
- `RefreshToken`, `Invitation` and `PasswordResetToken` each belong to a user and are stored hashed.

### Structure

- `Hostel` → `Building` → `Floor` → `Room` → `Bed`, each a one-to-many step.
- Room numbers are unique within a hostel; bed labels are unique within a room.
- `Bed.status` records only operational state (`ACTIVE`, `MAINTENANCE`, `BLOCKED`). Whether a bed is occupied is derived from its open allocation and exposed as a computed field, so the two cannot drift.

### Students

- `Student` is the profile. It optionally links to one `User`, created when the student is invited to log in.
- `Guardian` and `StudentDocument` are one-to-many from the student.
- `Admission` records the admission workflow and its current step for one student.
- `BedAllocation` joins a student to a bed with `startedAt` and `endedAt`, and holds the full history. Partial unique indexes on `bed_id` and on `student_id`, both `WHERE ended_at IS NULL`, allow only one open allocation per bed and per student. These are added as raw SQL in a migration. Allocation runs in a transaction that locks the bed row.

### Finance

- `FeeStructure` defines charges per hostel and room type; `StudentFeePlan` holds per-student overrides and discounts.
- `Invoice` belongs to a student for one billing period and is unique on `(studentId, billingPeriod)`, so generation is idempotent. It has many `InvoiceLineItem` rows (rent, mess, electricity, maintenance, fine, discount).
- `Payment` belongs to a student and is spread across invoices through `PaymentAllocation`, so one payment can clear several invoices and partial payments work.
- `GatewayOrder` and `WebhookEvent` track Razorpay. `Receipt` is one per payment. `Refund` points back to a payment.
- `DepositLedgerEntry` tracks the security deposit separately; it is a liability, not revenue, and is settled at check-out.
- "Previous due" is calculated from unpaid invoice balances, never copied forward as a line item. Copying double-counts once the old invoice is paid.
- Amounts are stored as integer paise.
- Issued invoices are never edited; corrections are adjustment lines. Financial rows are voided or reversed, never deleted.
- Invoice and receipt numbers come from a row-locked `Sequence` table per organization.

### Operations and cross-cutting

- `Complaint` (with `ComplaintComment`), `LeaveRequest`, `OutpassRequest` and `VisitorRequest` each belong to a student and record who acted on them.
- `Notice` belongs to an organization and optionally targets a hostel. `Notification` belongs to one user.
- `AuditLog` records actor, action, entity, entity ID, before and after.
- `File` holds metadata for every stored file.
- Soft delete applies to structure and people only.

## 7. Multi-tenant isolation

One shared database and schema, with `organizationId` on every tenant-owned table.

### Request flow

1. **Login** puts the user's organization into the signed access token. No endpoint or DTO accepts an organization ID from the client.
2. **The global auth guard** verifies the token and stores user ID, organization, role and assigned hostels in a request-scoped context (AsyncLocalStorage, via `nestjs-cls`). This is done in the guard, not middleware, because middleware runs before the user is known.
3. **A tenant-scoped Prisma client** (a Prisma client extension) reads that context on every query. For tenant models it adds the organization filter to reads, updates and deletes, and sets it on creates. If the context is missing, it throws instead of running unfiltered.
4. **Services add the hostel filter** for wardens and accountants, and the "own records" filter for students.

### Known gaps and their guards

| Gap                                                             | Guard                                                                                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Nested writes and includes are not intercepted by the extension | Composite foreign keys `(organizationId, id)`, so a row cannot reference another tenant's parent                                        |
| Raw SQL bypasses the filter                                     | Allowed only inside repositories, with the organization passed explicitly                                                               |
| Scheduled jobs and webhooks have no logged-in user              | They run inside an explicit "run as organization X" wrapper; the Razorpay webhook takes the organization from the stored `GatewayOrder` |
| Login and platform routes legitimately cross tenants            | A separate unscoped client, injectable only in the `auth` and platform modules                                                          |

### Other boundaries

- WebSocket connections authenticate on handshake and join only their own organization, hostel and user channels.
- File storage keys are prefixed by organization.
- An e2e test suite calls every endpoint as tenant B using tenant A's IDs. It must grow with every module.

## 8. Authentication and authorization

### Token flow

1. Login checks the password (argon2id) and returns an access token (JWT, about 15 minutes) plus a refresh token (about 30 days).
2. The access token is kept in browser memory and sent in the `Authorization` header. Claims: `sub`, `org`, `role`.
3. The refresh token is an opaque random string in an httpOnly `SameSite` cookie restricted to the auth routes. Only its hash is stored.
4. When the access token expires, the client calls refresh once (single-flight) and retries the failed requests. A page reload restores the session the same way.
5. Each refresh issues a new refresh token and invalidates the old one. If an old one is presented again, the whole token family is revoked.
6. Logout, password change and password reset revoke the user's refresh tokens.

A deactivated user or changed role takes effect within 15 minutes, when the access token expires. In development the Vite server proxies `/api` to port 3000 so the cookie is same-origin.

### Onboarding

There is no public sign-up. SUPER_ADMIN creates an organization and its first admin. Everyone else joins through a single-use, expiring invitation link. Password reset uses the same kind of token.

Deferred: Google login, OTP login, two-factor authentication.

### RBAC

- Permissions are named `resource:action`, for example `leave:approve` or `invoice:create`.
- A static role → permissions map lives in `packages/shared`. The backend enforces it; the frontend uses the same map to hide UI. No CASL and no permissions table.
- Each endpoint declares the permissions it needs; a global guard checks them.
- Services then check scope: is this record in my organization, my hostels, or mine? Out-of-scope records return 404, not 403.
- SUPER_ADMIN routes sit under `/platform` and use the unscoped client explicitly.

Guard order: `JwtAuthGuard` (global) → `PermissionsGuard` → service-level scope check.

## 9. API structure

REST under `/api/v1`, documented with Swagger.

```text
/auth/...                    login, refresh, logout, accept invitation, password reset
/users
/hostels, /buildings, /floors, /rooms, /beds      nested for creation and listing
/students, /admissions, /allocations
/fee-structures, /invoices, /payments, /refunds, /receipts
/payments/razorpay/orders, /payments/razorpay/verify, /webhooks/razorpay
/complaints, /leave-requests, /outpasses, /visitors, /notices, /notifications
/me/...                      student self-service; takes no student ID
/dashboards/..., /reports/...
/platform/...                SUPER_ADMIN only
```

Response shapes:

```json
{ "data": {}, "meta": { "page": 1, "limit": 20, "total": 134 } }
{ "error": { "code": "BED_ALREADY_OCCUPIED", "message": "...", "details": [] }, "requestId": "..." }
```

- Lists are paginated, filterable and sortable.
- State changes are explicit action endpoints such as `POST /leave-requests/:id/approve`, not edits to a status field.
- Controllers return plain values; `ResponseEnvelopeInterceptor` wraps them in `data`. Return a `PaginatedResult` to add `meta`.
- Throw `AppException(code, message, status)` for errors a client should branch on. Plain Nest HTTP exceptions get a code derived from their status (`NOT_FOUND`, `FORBIDDEN`); anything else becomes a generic 500 and is logged with its stack.
- Validation failures use the code `VALIDATION_FAILED` with one `details` entry per field. Unknown request properties are rejected.
- Every response carries an `x-request-id` header, repeated as `requestId` in error bodies and in the request log line.
- Student self-service goes through `/me/*`, which removes ID-guessing bugs for students.

## 10. Cross-cutting services

- **Audit**: one `AuditService`. Services call it explicitly inside the same transaction as the change, with before and after snapshots. A redaction list strips password hashes, tokens and document numbers.
- **Storage**: a `StorageService` interface with a local-disk driver now and an S3 driver later. Files are served only through an authenticated, authorized endpoint, never a static path.
- **Realtime**: one Socket.IO gateway. Modules emit domain events; the gateway turns them into invalidation signals.
- **Scheduler**: monthly invoice generation and leave start/end transitions. Every job is idempotent and safe to re-run after downtime.

## 11. MVP scope

| In                                                                                            | Later                                          |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Auth, invitations, RBAC, tenant isolation, audit log                                          | Google/OTP login, 2FA                          |
| Hostel structure and occupancy view                                                           | Mess module                                    |
| Students, admissions, documents, allocation, check-in/out                                     | Charts, reports, export                        |
| Fee structures, invoices, manual and Razorpay payments, receipts, refunds, deposit settlement | Subscription plans, usage limits, SaaS billing |
| Complaints, leave, outpass, visitors, notices, notifications                                  | S3 storage, row-level security                 |
| One simple dashboard per role                                                                 | Full super-admin dashboard                     |

## 12. Development phases

| Phase               | Content                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| 1. Foundation       | Workspace, NestJS, Docker Postgres, Prisma, config, error handling, logging, app shell |
| 2. Auth and tenancy | Organizations, users, login, refresh, invitations, RBAC, tenant client, audit service  |
| 3. Hostel structure | Hostels through beds, occupancy grid                                                   |
| 4. Students         | File storage, profiles, admissions, documents, allocation, check-in/out                |
| 5. Finance          | Fee structures, invoices, payments, Razorpay, receipts, refunds, dues                  |
| 6. Operations       | Realtime setup, complaints, leave, outpass, visitors, notices, notifications           |
| 7. Mess             | Menu, meal tracking, charges, feedback                                                 |
| 8. Analytics        | Charts, reports, export                                                                |
| 9. SaaS             | Plans, limits, platform billing, super-admin dashboard                                 |

Differences from the original roadmap: the audit service is built in Phase 2 and file storage at the start of Phase 4, so later modules use them from the start; each phase adds its tiles to a simple role dashboard, so the app always has a landing page.

Planned Phase 1 commits:

1. Workspace scaffold and tooling.
2. NestJS bootstrap with config validation.
3. Docker Postgres, Prisma and a health check.
4. Error filter, response envelope, logging and request IDs.
5. Vite, Tailwind and shadcn app shell with theming.
6. API client and Swagger.

## 13. Risks

- **Tenant leaks** through the gaps in section 7. The cross-tenant test suite is the main protection.
- **Double bed allocation** under simultaneous requests. Only the partial unique index reliably prevents it.
- **Trusting the browser's payment result.** The Razorpay webhook is the source of truth; the verify endpoint is a fast path. Both must be idempotent on the gateway payment ID, and the webhook needs the raw request body for signature verification.
- **Editing issued invoices.** Use adjustment lines.
- **Timezones.** Store UTC; compute billing periods and "today" in the organization's timezone.
- **Status drift.** `ON_LEAVE` is set by a scheduled job, which must be safe to re-run.
- **Document exposure.** Identity documents are served only through an authorized endpoint.
- **Secrets in audit logs.** Apply the redaction list.
- **Over-abstraction.** No generic base classes or premature repository layers.

## Local environment notes

Checked on 2026-10-09:

- Node 24.21.0 and npm 11.19.0 are installed.
- Docker 29.7.2 and Compose v5.5.0 are installed. Nothing was listening on port 5432.
