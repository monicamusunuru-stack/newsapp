# News app

## Run locally

Requirements: Node.js and a MongoDB instance (local or MongoDB Atlas).

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your MongoDB Atlas driver connection string for the `userdb` database, replace its placeholders, and set `JWT_SECRET` to a random secret of at least 32 characters.
3. Start the API and Vite app together with `npm run dev:all`.

Vite forwards `/api` requests to the API on port 5000. Set `PORT` in `.env` to change the API port and update the proxy in `vite.config.js` to match.

In Atlas, create a database user and allow the app's network address in Network Access. Keep the real connection string and credentials in `.env` only; `.env` is ignored by Git. The Atlas dashboard link alone does not provide the cluster hostname or database-user credentials.

## Authentication API

- `POST /api/auth/register` creates a reader account and signs it in.
- `POST /api/auth/login` verifies credentials and signs in.
- `GET /api/auth/me` returns the signed-in account.
- `POST /api/auth/logout` clears the session.

Passwords are hashed with bcrypt before storage. The signed JWT is kept in an HTTP-only cookie and is not exposed to browser JavaScript. User data is stored in MongoDB; the browser does not store account credentials.
