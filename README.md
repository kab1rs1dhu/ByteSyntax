# Byte Syntax

Byte Syntax is a full-stack collaboration platform that combines real‑time chat, video, task hand‑offs, and an immersive onboarding experience. The project is split into a `frontend` Vite/React app and a `backend` Express API that integrate with Stream Chat, Clerk authentication, and other cloud services. The current release represents ~5 weeks of part‑time work (≈180–200 hours) focused on polish, infrastructure, and third-party integrations.

## Features

- **Realtime conversations** powered by Stream Chat with custom theming and interaction tweaks.
- **Authentication & user management** through Clerk (OAuth/social login ready).
- **Interactive auth experience** featuring a Three.js particle background, responsive marketing hero, and consistent typography system.
- **Video & call support** via Stream's video SDK.
- **Installable PWA experience** with offline-first caching and manifest metadata.
- **Notifications & automations** scaffolded with Inngest and instrumented with Sentry for monitoring.
- **Shared design system** using custom CSS, Tailwind tooling, and consistent typography.

## Project Structure

```
.
├── frontend/        # React + Vite single page app
│   ├── src/components
│   ├── src/pages
│   ├── src/hooks
│   ├── src/styles
│   └── package.json
├── backend/         # Express API, integrates with Stream & MongoDB
│   ├── src/config
│   ├── src/controllers
│   ├── src/models
│   ├── src/routes
│   ├── src/server.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ (matching the version used by Vite/Express)
- npm (ships with Node) or your preferred Node package manager
- MongoDB instance (Atlas or local)
- Stream Chat/API keys
- Clerk publishable + secret keys
- Optional: Sentry DSN, Inngest keys, deployed URLs

## Environment Variables

Both apps load configuration from `.env` files. **Do not commit real secrets.** The samples below show the required keys; replace the values with your own.

### `frontend/.env`

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STREAM_API_KEY=xxxxxxxxxxxxxxxx
VITE_SENTRY_DSN="https://example.ingest.us.sentry.io/123"
VITE_API_BASE_URL="http://localhost:5001/api"
```

### `backend/.env`

```bash
PORT=5001
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bytesyntax_db
NODE_ENV=development

CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

STREAM_API_KEY=xxxxxxxxxxxxxxxx
STREAM_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

INGEST_EVENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
INGEST_SIGNING_KEY=signkey-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

CLIENT_URL=http://localhost:5173
```

## Getting Started

1. **Install dependencies**

   ```bash
   cd backend
   npm install

   cd ../frontend
   npm install
   ```

2. **Start the backend API**

   ```bash
   cd backend
   npm run dev
   ```

   The server runs on `http://localhost:5001` by default.

3. **Start the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   Vite serves the SPA on `http://localhost:5173`.

4. Open the frontend URL in your browser, sign in with Clerk, and begin exploring channels, calls, and messaging.

## Development Workflow

- **Branch naming**: use `feat/`, `fix/`, or `chore/` prefixes followed by a concise summary.
- **Commit messages**: present tense, 50 characters or fewer when possible (e.g., `feat: add message scheduling`).
- **Testing**:
  - Backend integration tests can live under `backend/src/__tests__`; run them with your preferred runner (Jest, Vitest, etc.).
  - Frontend component tests can live next to components (`Component.test.jsx`); wire up Vitest/Testing Library if needed.
  - Always run `npm run lint` (frontend) before pushing to keep styling consistent.
- **Code review**: ensure PRs describe the change, link to design docs/issues, and attach screenshots/gifs for UI tweaks.
- **CI**: set up GitHub Actions (or Vercel/Netlify hooks) to run lint/tests on every pull request.

## Deployment Playbook

### Backend

1. Provision environment variables in your hosting provider (Render, Railway, Vercel, etc.).
2. Allow outbound access to MongoDB Atlas or your database.
3. Point `CLIENT_URL` to the production frontend (`https://app.bytesyntax.com` for example).
4. Optionally add `SENTRY_DSN` if backend monitoring is desired.

### Frontend

1. Configure Vercel/Netlify to build with `npm install && npm run build`.
2. Provide environment variables: Clerk publishable key, Stream key, Sentry DSN, and API base URL.
3. Adjust `VITE_API_BASE_URL` for each environment (dev/staging/prod).

### Monitoring & Support

- **Sentry** captures frontend and backend errors for proactive issue tracking.
- **Stream** dashboard surfaces channel usage and rate limits.
- **Clerk** dashboard manages users, sessions, and OAuth connections.
- **Inngest** observability tools help debug background jobs and webhooks.

## Progressive Web App

- The frontend ships with a `manifest.webmanifest` and a lightweight service worker (`public/service-worker.js`) that precaches core assets.
- When served over HTTPS (or `http://localhost` for dev), browsers will prompt users to **Install Byte Syntax** from the address bar or menu.
- The app supports standalone display mode, custom theme color, and cached assets for limited offline access.
- To customize icons, replace `/public/logo.png` and `/public/logo-name.png` with 192×192 and 512×512 variants and update the manifest accordingly.

## Project Metrics

- **Time to MVP**: ~5 weeks (≈180–200 hours, 2–3 contributors).
- **Dependencies managed**: 20+ frontend packages, 10+ backend packages.
- **Major integrations**: Stream Chat, Stream Video, Clerk, Inngest, Sentry, MongoDB Atlas.
- **Primary languages**: TypeScript (frontend), JavaScript (backend), CSS (theming).

## Roadmap

- ✅ Real-time chat with theming and reactions
- ✅ Clerk-based authentication and onboarding flow
- ✅ Video meetings and live presence indicators
- ✅ Immersive auth landing built with Three.js
- 🔄 Message scheduling and reminders
- 🔄 Task board and pinned note system
- 🔄 Full automated test matrix (unit + e2e)
- 🔄 Localization and accessibility audit

## Contributing

1. Fork & clone the repository.
2. Create a feature branch (`git checkout -b feat/awesome-idea`).
3. Commit your changes and open a pull request.

Please keep formatting consistent and avoid committing `.env` files with real secrets.

## License

This project is currently unlicensed. Reach out to the maintainers if you plan to reuse significant portions of the code.
