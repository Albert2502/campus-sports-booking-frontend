# Campus Sports Booking (frontend) — design record

Everything agreed with the owner before implementation started. This is the reference for
what the project *is* and *why*. When a decision here changes, change it here first, with a
dated note on what changed and why.

> **Status:** agreed 2026-11-12. Milestones in §7; progress in `docs/STATUS.md`.

---

## 1. What it is

A web platform where the students and teachers of one university (USV) book campus sports
facilities (halls, courts) without overlaps and under fairness rules. University course project
("Ingineria programelor"), team of two: Galan Albert and Butnariu Alexandru. There are two
repositories: `campus-sports-booking-backend` (Node.js/Express REST API, PostgreSQL) and
`campus-sports-booking-frontend` (React SPA, mobile first). Run locally only (no deployment in
scope). The full background lives in `docs/backend-context.md` and `docs/frontend-context.md`;
the API contract is `docs/openapi.yaml`; the data model is `docs/erd.puml` / `docs/erd.png`.

Sources: Confluence space "Proiect_lab_IP" (techthieves.atlassian.net), Jira project **CB**
"Campus booking" (same site; CB-n = the old TEC-n), Figma prototype
`T0Jv1Xx6X947N9zoyUwLuC` ("Prototip – Rezervare facilități sportive"; pages Utilizator,
Componente, Administrator).

**Precedence:** where the context files and this record differ (they still say "TO CONFIRM"
or "OPEN" for several points decided here), this record wins.

## 2. Names and glossary

| Term | Meaning / notes |
| --- | --- |
| Captain (căpitan) | The user who made a booking. A role of a booking, not an account type. |
| Facility (facilitate) | A hall or court. Status `active`, `maintenance` or `inactive`. |
| Slot (interval) | A time slot of a facility (`time_slots`); availability `free`, `occupied`, `closed`. |
| Opening hours (program) | `facilities.opens_at`–`closes_at`; NULL = no restriction. |
| Soft delete | "Dezactivează" = `status = inactive`; there is no hard delete of facilities. |
| Booking rules | The single `booking_rules` row; business limits are read from it, never hard-coded. |
| Planificator | The scheduler (node-cron jobs), not an endpoint. |

UI copy is Romanian; code identifiers, comments and commit messages are English.

---

## 3. Agreed requirements

The business rules and open questions from the context files stand (`docs/backend-context.md`
§5, `docs/frontend-context.md` §5). Open questions (teacher vs student, auctions, exact sanction
rule, refunds, displaced users) stay configurable and are **not** invented. Below: what was
decided on top of them during planning (2026-11-12).

### Facilities (schema v3)

- **Facilities carry description, opening hours, status and images.** *Why:* the Figma admin
  screens show them and the team (Albert + Alexandru) chose to bring the database up to the
  prototype. *Rejected:* implementing only the v2 fields (would leave Figma fields unbacked).
- **`status` enum (`active`, `maintenance`, `inactive`) replaces the `active` boolean.** *Why:*
  one field, no impossible combinations. *Rejected:* a second boolean `under_maintenance`.
- **`maintenance`: the facility stays listed with its badge, its slots show `closed` and nobody
  can book them (`FACILITY_CLOSED`).** `inactive`: hidden from everyone but the admin.
  `facility_closures` stays for dated closures.
- **Price is per hour (`price_per_hour`); `requires_payment` is dropped; price 0 = free.**
  Slot price = slot duration in hours × `price_per_hour`; an open-match place = slot price /
  `total_places`, rounded to 2 decimals. A booking is created `pending` when its price > 0,
  otherwise `confirmed`. *Why:* matches Figma ("Preț / oră") and keeps one source of truth.
  *Rejected:* keeping `price_per_slot`; keeping `requires_payment` next to the price.
- **Opening hours limit students only.** Students and anonymous visitors do not see slots outside
  the opening hours (GET /slots leaves them out); if a student books one by id the answer is
  404 `NOT_FOUND`, as if the slot did not exist. Teachers and admins see and book them. The admin
  may create slots outside the hours. *Rejected:* display-only hours; a dedicated
  `OUTSIDE_OPENING_HOURS` error code.
- **Several images per facility (`facility_images`), uploaded to the backend's disk.** JPG/PNG,
  ≤ 5 MB, ≤ 5 per facility; the first image (lowest `position`) is the thumbnail; files are
  served from `/uploads`. *Rejected:* image URLs only (Figma shows drag-and-drop upload); a single
  image column.
- **No hard delete of facilities.** "Dezactivează" sets `status = inactive`, "Reactivează" sets
  it back. *Why:* bookings and reports reference facilities; a delete would cascade into history.
  *Rejected:* DELETE restricted to unused facilities.
- **GET /facilities filters with `status` = `active` (default) | `maintenance` | `inactive` |
  `all`;** values other than `active` are admin-only. *Rejected:* a separate admin route.
- **Facility search ("Caută facilitate") is client-side** (name and location, diacritics
  ignored). *Why:* a handful of facilities; no contract change. *Rejected:* a `q` parameter.

### Process

- **Lab 6 first (skeleton + facilities CRUD with images, FE↔BE demo), then the MVP from Jira
  CB.** Albert sets up both repos and the first steps; then Alexandru joins.
- **One branch per task, `feature/CB-<n>-<slug>`, PR into `main`, reviewed by the teammate.**
  PRs are opened only after asking. The planning docs use `feature/CB-1-planning-docs`.
- **Jira is updated directly** (the import CSV is no longer maintained). `docs/openapi.yaml` in
  the repos is the canonical contract; the Confluence attachment mirrors it.
- **Coding style: Google JavaScript style, enforced with current tools.** ESLint 10 flat config
  (`@eslint/js` recommended + prefer-const, no-var, eqeqeq, camelcase) and Prettier configured to
  Google formatting (2 spaces, single quotes, 80 columns, semicolons, trailing commas), plus
  `eslint-config-prettier`. *Rejected:* `eslint-config-google` (last release 2019, eslintrc only,
  uses rules ESLint 9 removed); pinning ESLint 8 (end of life).
- **Node.js 24 LTS** (`engines >=24`, `.nvmrc`), falling back to `>=22` only if 24 cannot be
  installed in the dev container.

### Non-negotiables

- Business limits come from `booking_rules`; money amounts are computed on the server.
- The API enforces permissions; hiding UI elements is never the only protection.
- Errors always use the `Error` body (`code`, `message` in Romanian, optional `details`).
- No secrets or `.env` in git; `.env.example` with placeholders only.
- No mock data or fallbacks in app code to make something look like it works.

---

## 4. Architecture

### Stack

Vite 8 + React 19 (JavaScript), `react-router`, `axios` (baseURL `/api/v1`, token added
automatically from the MVP on), TanStack Query 5, React Hook Form + `zod` 4,
**Tailwind CSS 4** (`@tailwindcss/vite`), `@fontsource/gentium-plus`, Vitest + React Testing
Library + jsdom + **MSW** for tests, `prettier-plugin-tailwindcss`. Later (MVP):
`react-day-picker` (Romanian locale), `date-fns`. Exact versions are pinned when each package is
added; every package is checked on npm first.

- **The MVP stack is used from Lab 6 on.** *Why:* no rewrite later; Lab 6 covers most of CB-5.
  *Rejected:* a minimal Lab 6 (fetch only) upgraded later.
- **Tailwind for styling,** with the Figma tokens as `@theme` variables in
  `src/styles/tokens.css`: principala `#1d4ed8`, accent `#f97316`, fundal `#f5f7fb`, text
  `#111827`, text-secundar `#6b7280`, bordura `#11182724`, suprafata `#ffffff`; font Gentium
  Plus (Bold 32/24/16/15/14, Regular 16/14 at line-height 1.4). *Rejected:* CSS Modules.
- **Font self-hosted via `@fontsource/gentium-plus`** so the demo works offline. *Rejected:*
  Google Fonts link.
- **MSW in tests** so the axios client and its error handling are exercised. *Rejected:*
  `vi.mock` of the API module.
- **The app talks to the real local backend from Lab 6 on; no mock API layer in app code.**
  *Why:* both repos are developed in parallel, Lab 6 asks for a working FE↔BE demo, and the
  working agreement forbids mock data in app code. Simulated APIs exist only in tests (MSW).
  *Rejected:* the fixtures/mock layer the frontend context allowed.
- **Same-origin calls through the Vite dev proxy** (`/api`, `/uploads` → backend, target set in
  `.env` as `VITE_BACKEND_URL`, default `http://localhost:3000`); axios uses the relative
  `baseURL` `/api/v1`. *Why:* no CORS setup needed in development and image URLs from the API
  (`/uploads/...`) work unchanged. *Rejected:* an absolute `VITE_API_URL` base URL in the client.

### Structure

```
src/  main.jsx  App.jsx (router)  api/ (axios client, facilities.js, sports.js, errors.js)
      layouts/ (AdminLayout)  pages/admin/ (FacilitiesPage …)  components/  hooks/
      styles/ (index.css, tokens.css)
tests/ (or *.test.jsx next to the code)   docs/
```

The dev server proxies `/api` and `/uploads` to the backend (default `http://localhost:3000`).

### Key flows

- **Lab 6 admin Facilities (`/admin/facilitati`)**, following the Figma frames "Admin –
  Facilități" (list, empty state, add, edit, saved; desktop 1440 and mobile 390): table on
  desktop, cards on mobile; Tip (sport) and Stare filters; client-side search; drawer (desktop) /
  full-screen panel (mobile) for add/edit; Dezactivează/Reactivează with confirmation; toast
  "Facilitatea a fost salvată"; image upload with previews and "× Șterge"; loading, empty and
  error states.
- **Admin layout as in Figma** (blue sidebar on desktop, bottom bar on mobile); in Lab 6 only
  "Facilități" is shown, the other items appear with their tasks. No auth yet: `TODO(CB-12)`
  AdminRoute.

---

## 5. Decisions

### Ruled during planning

1. **The Figma prototype wins over the older wireframe** (per the frontend context); screens are
   built at 390 px and 1440 px.
2. **Figma prices and hours in the mock rows are sample data;** real values come from the API.

### Decided during implementation

_None yet._

---

## 6. Interface / client

Romanian UI, mobile first. The frontend shows the server's answers for rules (limits, windows)
and never decides them. Every screen handles loading, empty, error and "taken meanwhile" states.
Error codes from the API map to Romanian messages in one place (`src/api/errors.js`).

---

## 7. Milestones

| | Scope |
| --- | --- |
| **M0** | Planning: docs, contract update, Jira sync. |
| **M1** | Lab 6: CB-2 repo setup, CB-5 React app (Tailwind, tokens, font, router, Query, axios, admin layout), admin Facilities CRUD screen, facility images in the form. |
| **M2** | MVP (Jira CB): CB-11, CB-12, CB-16…19, CB-26, CB-27, CB-33, CB-38, CB-41, CB-42, CB-43. Planned in detail after M1. |

**Gate for M1:** `npm run lint`, `npm test` and `npm run build` pass; against the local backend
the admin creates, edits, deactivates/reactivates a facility and uploads/removes images, on both
390 px and 1440 px.
