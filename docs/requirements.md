# Nivora Product Requirements

The owner's original build brief, condensed. It says what Nivora must do; [architecture.md](architecture.md) says how it is built.

## Goal

Nivora is a production-quality, multi-tenant SaaS platform for student hostel management, usable by hostel owners, administrators, wardens, accountants and students. It manages the full lifecycle of a stay:

Admission → Room/Bed Allocation → Check-in → Fees → Complaints → Leave/Outpass → Visitors → Notices → Check-out → Deposit Settlement

It must support multiple organizations, each with multiple hostels.

## Tech stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI, Zustand, React Router, TanStack Query, Recharts, Framer Motion where useful.
- **Backend**: Node.js, NestJS, TypeScript, PostgreSQL, Prisma.
- **Realtime**: WebSockets, only where they add value (notifications, visitor updates, complaint updates, dashboard updates).
- **Payments**: Razorpay.
- **File storage**: local disk in development, designed to move to S3-compatible storage for student documents, identity documents, complaint attachments and other files.

## Roles

Only these five roles exist. The backend must enforce permissions; hiding UI is not enough.

| Role | Manages |
|---|---|
| SUPER_ADMIN | Organizations, subscription plans, platform settings, system-wide analytics |
| HOSTEL_ADMIN | Students, hostels, buildings, floors, rooms, beds, fees, payments, complaints, notices, reports, staff and wardens |
| WARDEN | Student operations, room and bed information, leave requests, outpass requests, visitors, complaints, notices, check-in and check-out, daily activity |
| ACCOUNTANT | Fee structures, invoices, payments, outstanding dues, receipts, refunds, financial reports |
| STUDENT | Own data only: view profile, room and bed, fees, receipts and notices; make payments; raise complaints; submit leave and outpass requests; manage visitor requests |

## Hostel structure

Organization → Hostel → Building/Block → Floor → Room → Bed → Student.

- A room has multiple beds. A bed has at most one active occupant.
- Track: room number, room type, capacity, floor, building, bed number, bed status, room status, occupancy.
- The UI shows a room as a grid of beds with occupant names or EMPTY.

## Students

Profile fields: full name, email, phone, date of birth, gender, profile photo, college, course, year/semester, guardian information, emergency contact, address, identity documents, admission date, check-in date, check-out date, current hostel, current room, current bed, status.

Statuses: `ACTIVE`, `ON_LEAVE`, `CHECKED_OUT`, `SUSPENDED`.

## Admission and allocation

Workflow: Admission → Student Details → Documents → Fee/Deposit → Room Selection → Bed Allocation → Check-in.

Two students must never be assigned the same bed. Use database constraints and transactions.

## Finance

Supports monthly rent, mess charges, electricity charges, maintenance charges, security deposit, discounts, fines, previous dues, payments, refunds, invoices, receipts and outstanding balances.

```text
Base Rent + Mess + Electricity + Services + Previous Due + Fine - Discount = Total Payable
```

Financial logic lives in dedicated services, not controllers, and uses database transactions.

## Razorpay

Order creation, payment verification, payment status, webhook handling, payment history, receipt generation. Never store card information. Verification happens on the backend.

## Complaints

A student raises a ticket (for example `#HT-1042`) with category, issue, room and priority. Statuses: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`. Wardens and admins manage and update complaints. Students see their complaint history.

## Leave

A student submits from date, to date and reason; the request starts as `PENDING`. The warden can approve, reject or request changes. The student's status updates when leave begins and ends.

## Outpass

Tracks destination, reason, departure time, expected return, actual return and approval status. The warden approves.

## Visitors

A student creates a visitor request. Tracks visitor name, phone, relationship, student visited, expected visit time, entry time, exit time and approval status. The warden approves or rejects and records entry and exit.

## Mess (not in the first MVP)

Daily menu (breakfast, lunch, dinner, snacks), meal tracking, mess charges, feedback, food complaints.

## Notices

Admins and wardens publish notices. Types: general, emergency, maintenance, fee reminder, holiday, important announcement. Students see the notices relevant to them.

## Dashboards

- **Hostel admin**: total students, total beds, occupied beds, available beds, occupancy %, pending fees, monthly revenue, pending complaints, students on leave, today's visitors. Charts: occupancy trends, revenue trends, payment collection, complaints, admissions, check-outs.
- **Warden**: current occupancy, today's check-ins and check-outs, students on leave, pending leave requests, pending outpass requests, pending complaints, today's visitors, recent notices.
- **Accountant**: today's collections, monthly revenue, pending payments, overdue payments, recent transactions, refunds.
- **Student**: current room and bed, current fees, outstanding amount, recent payments, active complaints, leave status, outpass status, notices.

## Multi-tenancy

Data of one organization must never be accessible to another. Every tenant-sensitive query enforces the boundary. The backend derives the organization from the authenticated session and never trusts a client-supplied tenant ID.

## Database

PostgreSQL with Prisma. Proper relational design: foreign keys, unique constraints, indexes, transactions, soft deletion where appropriate, created and updated timestamps, audit fields. No giant catch-all tables.

## Authentication

- **MVP**: login, registration by invitation, password hashing, JWT, refresh tokens, role-based and tenant-aware authorization, password reset.
- **Later**: Google login, OTP login, two-factor authentication.

## Audit logs

A reusable audit system recording who, what, when, entity, entity ID, before and after. Examples: admin changed a student's room, warden approved a leave request, accountant recorded a payment, admin changed monthly rent, warden checked in a visitor.

## UI and design

A modern SaaS feel, inspired by Linear, Stripe Dashboard, Notion and modern property-management dashboards. Clean typography, spacious layouts, responsive sidebar, tables, cards, charts, filters, search, command palette, notifications, dark and light mode, mobile-responsive layouts. Use Shadcn UI. Avoid a generic Bootstrap-admin look.

## Development rules

1. Build one feature at a time.
2. Never generate the entire application at once.
3. Explain important architectural decisions.
4. Keep code production-ready.
5. Use TypeScript consistently.
6. Create reusable components.
7. Keep business logic inside services.
8. Validate all API input.
9. Use transactions for critical operations.
10. Use pagination for large datasets.
11. Add database indexes where appropriate.
12. Never trust client-provided tenant IDs.
13. Never expose sensitive documents publicly.
14. Never store passwords in plaintext.
15. Never store payment card information.
16. Keep API responses consistent.
17. Do not over-engineer.
18. Avoid premature abstractions.
19. Do not introduce microservices.
20. Keep the system easy to maintain.

## Original roadmap

| Phase | Items |
|---|---|
| 1. Foundation | Project architecture, repository structure, frontend setup, NestJS setup, PostgreSQL setup, Prisma setup, environment configuration, error handling, logging, API structure |
| 2. Authentication and users | Organizations, users, roles, authentication, JWT and refresh tokens, RBAC, tenant isolation |
| 3. Hostel structure | Hostels, buildings, floors, rooms, beds, occupancy |
| 4. Students | Profiles, admissions, documents, bed allocation, check-in, check-out |
| 5. Finance | Fee structures, monthly invoices, payments, Razorpay, payment verification, receipts, refunds, outstanding dues |
| 6. Operations | Complaints, leave, outpass, visitors, notices, notifications |
| 7. Mess | Menu, meal tracking, mess charges, feedback |
| 8. Analytics | Four role dashboards, occupancy, revenue and complaint analytics, reports, export |
| 9. SaaS | Subscription plans, organization settings, usage limits, SaaS billing, super-admin dashboard |

The approved adjustments to this roadmap are in [architecture.md](architecture.md), section 12.
