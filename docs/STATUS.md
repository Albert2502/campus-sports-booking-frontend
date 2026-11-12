# Status

Where the project actually stands, kept up to date as milestones land and issues get fixed.
`docs/DESIGN.md` is the decision record and changes rarely; this file changes often.

_Last updated: 2026-11-12._

## Current work

- **Task:** M0 planning docs, branch `feature/CB-1-planning-docs`.
- **Files touched:** `docs/` (context files, openapi.yaml, erd.puml/png, DESIGN.md, STATUS.md), `AGENTS.md`, `README.md`.
- **Done so far:** inputs copied into `docs/`; DESIGN.md written. Schema v3, seed, ERD and openapi.yaml were changed in the backend repo; `docs/openapi.yaml`, `docs/erd.*` here are copies of those.
- **Next step:** commit and push; ask before opening the PR; review the Jira edit list with the owner, then apply it; replace the openapi attachment on Confluence ("Document swagger").
- **Blockers / open questions:** none.

## Milestones

| | Scope | Status |
| --- | --- | --- |
| **M0** | Planning: docs, schema v3, contract update, Jira sync | In progress |
| **M1** | Lab 6: CB-2 repo setup, CB-5 React app, admin Facilities CRUD screen, facility images UI | Not started |
| **M2** | MVP frontend tasks from Jira CB (planned after M1) | Not started |

## Bugs found and fixed

_None yet._

## Open issues

- `docs/openapi.yaml` has 5 lint errors and 6 warnings under `redocly lint` (`nullable-type-sibling` ×3, `struct` ×2, missing 4XX on 4 operations, no license, example server). They were already in the team's original file; the v3 edits added none. To fix in a separate change once the team agrees.
- Remote branches `claude/gracious-goodall-oqd3wc` (backend) and `claude/admiring-gates-0gfcp0` (frontend) are leftovers of an earlier session; their content is already on this branch. They have to be deleted on GitHub by hand (deletion from the dev container is refused).

## Still to do

- Jira sync (edits to CB-2, CB-4, CB-14, CB-15, CB-21, CB-30; three new tasks) — after the owner reviews the list.
- Confluence "Document swagger": replace the openapi attachment with this version.
- `TODO(CB-12)`: `/admin` is open in Lab 6; CB-12 adds AdminRoute.

## Not yet verified

- Figma frames were read through screenshots and layer names only (figma.com is blocked by the container network), so exact spacing and sizes still need checking with the Figma inspector during CB-5.
