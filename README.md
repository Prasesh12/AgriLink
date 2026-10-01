# AgriLink

AgriLink is an agricultural e-commerce marketplace combined with e-governance services for farmers, buyers, government officers and admins. Final year BSc CSIT project (Tribhuvan University, Nepal).

See [CLAUDE.md](./CLAUDE.md) for the full project brief, data model, business rules and sprint plan.

## Status

Sprint 0 (project setup) complete. See sprint summaries in commit history for progress.

## Structure

```
agrilink/
├── client/   # React (Vite) frontend
└── server/   # Node.js/Express backend
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

### Server

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL etc.
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

The client runs on http://localhost:5173 and proxies/calls the API at the URL configured in `client/.env` (`VITE_API_URL`, default `http://localhost:4000/api`). The server runs on http://localhost:4000 by default.
