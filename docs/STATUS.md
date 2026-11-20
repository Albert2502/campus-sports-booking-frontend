# Status

Where the project actually stands, kept up to date as milestones land and issues get fixed.
`docs/DESIGN.md` is the decision record and changes rarely; this file changes often.

_Last updated: 2026-11-20._

## Current work

- **Task:** CB-48 screen 09 Profil, branch `feature/CB-48-profile-page`: route `/profil`,
  profile data and account status from `GET /users/me` (incl. `noShowCount`, backend PR #3),
  "Schimbă parola" link, "Deconectare"; Vitest + React Testing Library + MSW setup. Next in
  the stack: CB-50 change-password screen, then CB-51 password reset screens.
- **Files touched:** `package.json`, `package-lock.json`, `vite.config.js`, `src/test/`,
  `src/App.jsx`, `src/layouts/UserLayout.jsx`, `src/components/icons.jsx`, `src/lib/format.js`,
  `src/pages/ProfilePage.jsx`, `src/pages/ProfilePage.test.jsx`, `docs/openapi.yaml` (synced
  with the backend: `noShowCount`), `docs/DESIGN.md`, `docs/STATUS.md`.
- **Done so far:** screen 09/09b at `/profil` (8 tests green, checked at 390/1440 against
  Figma); Vitest + RTL + MSW setup; Profil in the phone bar.
- **Next step:** PR for Alexandru's review; then CB-50 on `feature/CB-50-change-password-page`.
- **Blockers / open questions:** none.

## Milestones

| | Scope | Status |
| --- | --- | --- |
| **M0** | Planning: docs, schema v3, contract update, Jira sync (done 2026-11-12: CB-2, 4, 14, 15, 21, 30 edited; CB-44, 45, 46 created) | Done 2026-11-13 (PR #1 merged; openapi also on Confluence "Document swagger", attachment v2) |
| **M1** | Lab 6: CB-2 repo setup, CB-5 React app, CB-45 admin Facilities CRUD screen, CB-46 facility images UI | Not started |
| **M2** | MVP frontend tasks from Jira CB (planned after M1) | Not started |

## Bugs found and fixed

- **Frontend, CB-12:** after signing in from a protected page, the app opened `/` instead
  of that page. Cause: `LoginPage` redirected to `/` as soon as the user was set, before the
  submit handler navigated to the saved page. Fix: one redirect, to `location.state.from`
  or `/`.

## Open issues

- `docs/openapi.yaml` has 5 lint errors and 6 warnings under `redocly lint` (`nullable-type-sibling` ×3, `struct` ×2, missing 4XX on 4 operations, no license, example server). They were already in the team's original file; the v3 edits added none. To fix in a separate change once the team agrees.
- Remote branches `claude/gracious-goodall-oqd3wc` (backend) and `claude/admiring-gates-0gfcp0` (frontend) are leftovers of an earlier session; their content is already on this branch. They have to be deleted on GitHub by hand (deletion from the dev container is refused).

## Still to do

- `TODO(CB-12)`: `/admin` is open in Lab 6; CB-12 adds AdminRoute.
- `TODO(CB-27)` in `src/App.jsx`: "Rezervări" in the menu opens a "not ready" page until
  screen 06 exists.
- `TODO(CB-17)` in `src/App.jsx`: "Închiriază un teren" on screen 00 opens `/calendar`, a
  "not ready" page until screen 02 exists.
- `TODO(CB-19)` in `src/App.jsx`: "Închiriază" on a suggested facility opens
  `/facilitati/:facilityId`, a "not ready" page until screen 03 exists.
- After login every role lands on screen 00, the admin too; the admin area and its menu
  come with CB-12 (AdminRoute) and CB-45.
- `TODO(CB-50)` in `src/App.jsx`: "Schimbă parola" on the profile opens a "not ready" page
  until the change-password screen exists.
- `TODO(M2)` in `src/pages/ProfilePage.jsx`: the "Plătește amenda" button on a blocked
  account (needs fine payments) and the "Notificări prin email" switch (nothing stores the
  setting yet); left out instead of shown as fake controls (DESIGN §5, 4).
- CB-41: the Vitest + React Testing Library + MSW setup landed with CB-48; the full booking
  flow tests are still to write. Screens 00 and 01 have no automated tests yet.

## Not yet verified

- Figma frames were read through screenshots and layer names only (figma.com is blocked by the container network), so exact spacing and sizes still need checking with the Figma inspector during CB-5.
- Screen 09 (and 09b, blocked account) was compared with Figma by eye at 390 px and 1440 px,
  with the seed accounts `ana@campus.test` and `dan@campus.test`.
- Screens 00 and 01 were compared with the Figma frames by eye at 390 px and 1440 px, not
  with the inspector. The seed facilities have no images, so the cards show a placeholder
  until images are uploaded (CB-44, CB-46).
