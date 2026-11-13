# Campus Sports Booking — frontend

Web app (React, Vite, Tailwind) for booking campus sports facilities.
Course project, USV "Ingineria programelor".

Status: planning in progress (see `docs/STATUS.md`). Run instructions arrive
with the first setup task (CB-2).

- Design and decisions: `docs/DESIGN.md`
- Progress: `docs/STATUS.md`
- API contract: `docs/openapi.yaml`
- Data model: `docs/erd.png`
- Working agreement for contributors and AI tools: `AGENTS.md`

## Demo (branch `demo/login-booking`)

Login, the home screen, the facility details with booking, the booking
confirmation, "Rezervările mele", and two admin pages (bookings and facilities),
styled after the Figma prototype. It needs the backend demo running (same branch
name in `campus-sports-booking-backend`).

1. `npm install`
2. Optional: copy `.env.example` to `.env` if the backend is not on port 3000.
3. `npm run dev` and open http://localhost:5173.

The demo accounts are created by `npm run db:reset` in the backend
(`db/reset-demo.js`).
