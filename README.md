# Service Marketplace

Vite + React frontend for a multi-role service marketplace app.

## Scripts

```bash
npm install
npm run dev
```

## Backend connection

The app talks to **glow-fix-backend** (NestJS) at `http://localhost:3000/api/v1`.

1. Start the API from `glow-fix-backend/api` (see that repo’s README).
2. Copy `.env.example` → `.env` in this folder.
3. Run `npm run dev` (Vite on port **5173** by default).

In development, HTTP calls use `/api/v1` on the Vite origin; the dev proxy forwards `/api` to the backend.

### Implemented on the backend today

- Auth: login, register (client/manager), OTP verify, refresh, logout, sessions, change password, Google OAuth
- Users: `GET /users/me`, avatar upload

### Not yet on the backend

Client bookings, discover, provider dashboards, admin, chat, and notifications routes in the frontend will return **404** until those modules are added to glow-fix-backend.

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full API base URL including `/api/v1` |
| `VITE_API_PROXY_TARGET` | Backend origin for Vite dev proxy |
| `VITE_SOCKET_URL` | Socket.io server (when chat is implemented) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |

In development, the Vite proxy sends API traffic to the backend on the same browser origin, so you do not need to change backend code for local frontend dev. For production, set `VITE_API_URL` to your deployed API (including `/api/v1`).

## Stack

- React, Vite, JavaScript
- Tailwind CSS v4 and HeroUI
- Redux Toolkit, React Query, Axios
- React Router DOM, React Hook Form, Zod
