# Status

Where the project actually stands, kept up to date as milestones land and issues get fixed.
`docs/DESIGN.md` is the decision record and changes rarely; this file changes often.

_Last updated: 2026-11-25._

## Current work

- **Task:** CB-46 facility images in the admin drawer, branch
  `feature/CB-46-facility-images-ui` (stacked on CB-45, PR #7): "Imagini" section with a
  drop zone / file picker (JPG, PNG), one `POST /facilities/{id}/images` per file, previews
  with "× Șterge" (`DELETE`); server messages shown per file (size, type, the 5-image limit).
  Images exist only for a saved facility, so "Adaugă" shows "Salvează facilitatea ca să adaugi
  imagini" and, after the first save, the drawer stays open in edit mode (DESIGN §5, 10).
- **Files touched:** `src/api/facilities.js`, `src/pages/admin/` (drawer, new images
  section, page), tests, `docs/DESIGN.md`, `docs/STATUS.md`.
- **Done so far:** section, uploads, previews, delete, create → edit mode; 67 tests green;
  checked in the browser against backend CB-44 at 390/1440 (7 files: 5 uploaded, the 6th
  refused by the limit, a text file refused by type; delete; list thumbnail updated).
- **Next step:** PR for Alexandru's review (stacked on PR #7).
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

- `docs/openapi.yaml` (backend): `location` is not marked `nullable` in `Facility` and
  `FacilityInput`, but the API accepts `null` / `''` and returns `null` for an empty location;
  the admin form sends `null`. To fix in the backend contract and sync.
- `docs/openapi.yaml` has 5 lint errors and 6 warnings under `redocly lint` (`nullable-type-sibling` ×3, `struct` ×2, missing 4XX on 4 operations, no license, example server). They were already in the team's original file; the v3 edits added none. To fix in a separate change once the team agrees.

## Still to do

- `TODO(polish)` in `src/pages/admin/useModalBehavior.js`: the drawer and the confirmation
  dialog do not trap focus or give it back to the button that opened them; Escape closes the
  drawer without asking about unsaved changes.
- The production bundle is over Vite's 500 kB warning (520 kB, 163 kB gzipped) since the
  admin screen; splitting the admin routes with `React.lazy` would fix it. Not urgent for a
  local-only app.
- `TODO(CB-27)` in `src/App.jsx`: "Rezervări" in the menu opens a "not ready" page until
  screen 06 exists.
- `TODO(CB-17)` in `src/App.jsx`: "Închiriază un teren" on screen 00 opens `/calendar`, a
  "not ready" page until screen 02 exists.
- `TODO(CB-19)` in `src/App.jsx`: "Închiriază" on a suggested facility opens
  `/facilitati/:facilityId`, a "not ready" page until screen 03 exists.
- `TODO(M2)` in `src/pages/ProfilePage.jsx`: the "Plătește amenda" button on a blocked
  account (needs fine payments) and the "Notificări prin email" switch (nothing stores the
  setting yet); left out instead of shown as fake controls (DESIGN §5, 4).
- CB-41: the Vitest + React Testing Library + MSW setup landed with CB-48; the full booking
  flow tests are still to write. Screens 00 and 01 have no automated tests yet.

## Not yet verified

- Facility images (CB-46): closing the drawer during a multi-file upload stops the files not
  sent yet (the one in flight still finishes); not checked in the browser. Dropping a file
  outside the drop zone lets the browser open it.
- Admin Facilities (CB-45) compared with the Figma frames by eye at 390 and 1440 px, not with
  the inspector. The time inputs showed AM/PM in the headless browser of the dev container
  (its system locale); a browser set to Romanian should show 24-hour times, not checked.
- The reset link was opened from a token made locally, not from a real email (the dev
  container cannot send email); the backend PR #5 lists how to check Ethereal delivery.
- Figma frames were read through screenshots and layer names only (figma.com is blocked by the container network), so exact spacing and sizes still need checking with the Figma inspector during CB-5.
- Screen 09 (and 09b, blocked account) was compared with Figma by eye at 390 px and 1440 px,
  with the seed accounts `ana@campus.test` and `dan@campus.test`.
- Screens 00 and 01 were compared with the Figma frames by eye at 390 px and 1440 px, not
  with the inspector. The seed facilities have no images, so the cards show a placeholder
  until images are uploaded (CB-44, CB-46).
