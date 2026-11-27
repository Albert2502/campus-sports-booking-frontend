# Campus Sports Booking — frontend

Web app (React, Vite, Tailwind) for booking campus sports facilities.
Course project, USV "Ingineria programelor".

Status: see `docs/STATUS.md`.

## Run locally

Needs Node.js 24 and the backend (`campus-sports-booking-backend`) running on
http://localhost:3000; see its README.

1. `npm install`
2. Optional: copy `.env.example` to `.env` if the backend runs elsewhere
   (`VITE_BACKEND_URL`).
3. `npm run dev` and open http://localhost:5173. Sign in with a seed account,
   e.g. `ana@campus.test` / `parola123` (student) or `prof.radu@campus.test` /
   `parola123` (teacher).

Other scripts: `npm run build`, `npm run lint`, `npm run format`.

- Design and decisions: `docs/DESIGN.md`
- Progress: `docs/STATUS.md`
- API contract: `docs/openapi.yaml`
- Data model: `docs/erd.png`
- Working agreement for contributors and AI tools: `AGENTS.md`

## Run with Docker

The frontend has no compose file of its own: the backend's `docker-compose.yml`
builds this repo (it must be cloned next to the backend, as
`campus-sports-booking-frontend`) and serves it with nginx on
http://localhost:8080, together with the API and PostgreSQL. See "Run with
Docker" in the backend README.
