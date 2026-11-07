# Qutam Travels

A travel and tour website prototype for Qutam Travels, using a red, black, and white brand palette. It includes a static HTML/CSS/JavaScript website and an Express API for tours, bookings, contact inquiries, and admin authentication.

## Project structure

- `backend/` — Express API, Mongoose models, authentication, and email utility
- `frontend/pages/` — homepage, tour listing/detail, contact, login, and admin dashboard pages
- `frontend/assets/` — shared CSS and browser JavaScript

## Run locally

Requirements: Node.js and npm. MongoDB is optional for demo mode and required for persistent data and logout revocation.

From the project directory, install and start the app:

```bash
cd backend
npm install
npm run dev
```

Open `http://localhost:5000` for the public homepage, or `http://localhost:5000/pages/login.html` for admin sign-in. Express serves both the static frontend and API on the same origin. The development admin defaults are `admin@qutamtravels.com` / `Qutam@123`; override them with environment variables before using this outside a local prototype.

## Environment configuration

Copy `.env.example` to `.env` in the project root and replace the example values. The local Node process also reads `backend/.env` if you prefer to keep backend settings there. For Docker Compose, the root `.env` file is used.

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
```

`PORT` defaults to `5000`. `MONGODB_URI` defaults to `mongodb://localhost:27017/qutam-travels`. In production mode, MongoDB connection failure stops the API instead of falling back to demo data. Set a unique `JWT_SECRET`, `ADMIN_EMAIL`, and strong `ADMIN_PASSWORD`; never commit real secrets.

Contact email uses SMTP when `EMAIL_PASS` is configured. Without it, the API logs an email preview instead of sending a message. Supply valid SMTP credentials to enable delivery.

## Docker deployment

With Docker Engine and the Compose plugin installed:

1. Copy `.env.example` to `.env` and set unique admin credentials and a long random `JWT_SECRET`.
2. Run `docker compose up --build` from the project directory.
3. Open `http://localhost:5000`.

Compose starts MongoDB with a persistent named volume and the application in production mode. `docker compose down` stops the services but preserves the database volume. `docker compose down --volumes` also deletes stored data.

## Vercel static deployment

The root `vercel.json` publishes the `frontend/` directory and serves the main homepage at `/`. In Vercel, set the project root to `qutam-travels` (the directory containing `vercel.json`). This deploys the static website only; the Express API and database require a separate backend deployment.

## Included functionality

- Public homepage, tour listing, tour detail, and contact pages
- Tour list/detail and booking/contact API endpoints
- Admin login using an eight-hour JWT
- Authenticated admin tour creation, editing, and deletion
- Admin logout endpoint that revokes the current JWT in MongoDB, with in-memory fallback in demo mode
- MongoDB-backed persistence when a database is available
- Demo data fallback when MongoDB is unavailable
- Same-origin static frontend and API server
- Docker Compose configuration for the app and MongoDB
- Node built-in integration tests (`npm test` from `backend/`)

## API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API health check |
| `POST` | `/api/v1/auth/login` | Public | Sign in and receive an admin token |
| `GET` | `/api/v1/auth/me` | Bearer token | Validate the current token |
| `POST` | `/api/v1/auth/logout` | Bearer token | Revoke the current token |
| `GET` | `/api/v1/tours` | Public | List tours |
| `GET` | `/api/v1/tours/:id` | Public | Get a tour |
| `POST` | `/api/v1/tours` | Admin bearer token | Create a tour |
| `PUT` | `/api/v1/tours/:id` | Admin bearer token | Update a tour |
| `DELETE` | `/api/v1/tours/:id` | Admin bearer token | Delete a tour |
| `GET` | `/api/v1/bookings` | Admin bearer token | List bookings |
| `POST` | `/api/v1/bookings` | Public | Submit a booking request |
| `POST` | `/api/v1/contact` | Public | Submit a contact inquiry |

## Operational notes

- Without MongoDB, tours, bookings, and JWT revocations are held in process memory and reset when the API restarts. Production mode requires a working MongoDB connection.
- Admin JWTs expire after eight hours. Revoked-token records are stored in MongoDB and automatically expire; demo-mode revocations are not durable.
- Email delivery requires valid SMTP credentials. Without them, contact requests are logged as previews.
- The Docker Compose setup is a deployable starting point. Public internet deployment still requires HTTPS termination, production secrets, database backups, and monitoring appropriate to the hosting provider.
- Run the automated API checks with `cd backend` followed by `npm test`.
