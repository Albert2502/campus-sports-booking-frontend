# Status

Where the project actually stands, kept up to date as milestones land and issues get fixed.
`docs/DESIGN.md` is the decision record and changes rarely; this file changes often.

_Last updated: 2026-11-20._

## Current work

- **Task:** login page and main page (DESIGN §5, 2026-11-20), branch
  `feature/CB-11-login-and-home-pages`, against the backend branch
  `feature/CB-7-login-and-home-api`. Steps, one commit each: CB-2 repo setup, CB-5 React
  app, CB-11 screen 01 Autentificare (background, then the form and session), CB-12
  protected routes, CB-16 screen 00 Bun venit (account card, then suggested facilities).
- **Files touched:** `package.json`, `package-lock.json`, tool configs, `.gitignore`,
  `index.html`, `public/`, `src/`, `README.md`, `docs/DESIGN.md`, `docs/STATUS.md`.
- **Done so far:** CB-2 configs (Vite with the `/api` and `/uploads` proxy, ESLint,
  Prettier, `.nvmrc`, `.gitignore`); CB-5 React app (Tailwind 4 with the Figma tokens,
  Gentium Plus, react-router, TanStack Query, axios client, `src/api/errors.js`, user layout
  with the top bar on desktop and the bottom bar on phones); CB-11 backdrop and card of
  screen 01 (`/login`).
- **Next step:** CB-11 login form and session.
- **Blockers / open questions:** none; the branch is not pushed yet.

## Milestones

| | Scope | Status |
| --- | --- | --- |
| **M0** | Planning: docs, schema v3, contract update, Jira sync (done 2026-11-12: CB-2, 4, 14, 15, 21, 30 edited; CB-44, 45, 46 created) | Done 2026-11-13 (PR #1 merged; openapi also on Confluence "Document swagger", attachment v2) |
| **M1** | Lab 6: CB-2 repo setup, CB-5 React app, CB-45 admin Facilities CRUD screen, CB-46 facility images UI | Not started |
| **M2** | MVP frontend tasks from Jira CB (planned after M1) | Not started |

## Bugs found and fixed

_None yet._

## Open issues

- `docs/openapi.yaml` has 5 lint errors and 6 warnings under `redocly lint` (`nullable-type-sibling` ×3, `struct` ×2, missing 4XX on 4 operations, no license, example server). They were already in the team's original file; the v3 edits added none. To fix in a separate change once the team agrees.
- Remote branches `claude/gracious-goodall-oqd3wc` (backend) and `claude/admiring-gates-0gfcp0` (frontend) are leftovers of an earlier session; their content is already on this branch. They have to be deleted on GitHub by hand (deletion from the dev container is refused).

## Still to do

- `TODO(CB-12)`: `/admin` is open in Lab 6; CB-12 adds AdminRoute.
- `TODO(CB-27)` in `src/App.jsx`: "Rezervări" in the menu opens a "not ready" page until
  screen 06 exists.

## Not yet verified

- Figma frames were read through screenshots and layer names only (figma.com is blocked by the container network), so exact spacing and sizes still need checking with the Figma inspector during CB-5.
