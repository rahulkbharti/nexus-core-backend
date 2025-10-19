# Library Management System — Backend

A robust backend for a multi-tenant library management system built with Node.js, Express, TypeScript, and Prisma.

#### DATABASE DESIGN:

![PostgreSQL](./nexus-core%20-%20public.png)

## Features

- Multi-tenant support — manage multiple independent libraries from one backend.
- Authentication & authorization — signup, login, JWT, and Google OAuth 2.0 social login.
- Book management — full CRUD for books and metadata.
- Member management — create, update, and track member status.
- Loan management — track borrows, returns, and due dates.
- Reservation system — allow members to reserve books currently on loan.
- Notifications — automated alerts for due dates, reservations, and events.
- Reporting & analytics — operational insights and usage reports.
- Email integration — automated emails for password resets and notifications.

## Tech stack

- Framework: Node.js + Express
- Language: TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Caching: Redis
- Auth: JWT & Google OAuth 2.0
- Authorization: Role-Based Access Control (RBAC) with custom staff permissions
- Security: Rate limiting (express-rate-limit)
- Logging: morgan
- Containerization: Docker

## Getting started

1. Clone the repository

   ```bash
   git clone https://github.com/rahulkbharti/nexuscode-backend.git
   cd nexuscode-backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment
   - Create a `.env` with required variables (DATABASE_URL, JWT_SECRET, OAuth credentials, Redis URL, etc.).
   - Ensure PostgreSQL and Redis servers are running.

## Development

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (creates dev database schema)
npx prisma migrate dev --name init

# Start the development server
npm run dev
```

## Production

```bash
# Build the project
npm run build
```

Important: Prisma may require copying the query engine binary into the build output. Example for Windows:

```bash
cp generated\prisma\query_engine-windows.dll.node dist\generated\prisma\query_engine-windows.dll.node
```

On Linux/macOS the filename will differ; adjust accordingly.

```bash
# Start the production server
npm run start
```
