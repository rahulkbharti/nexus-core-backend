# Featues

- Multi-Tenant Support
- User Authentication and Authorization
- Book Management (CRUD Operations)
- Member Management
- Loan Management
- Reservation System
- Notification System
- Reporting and Analytics
- Email for Forget Password and Notifications

# Tech Stack

- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis for Caching
- JWT for Authentication
- Google OAuth 2.0 for Social Login
- RBAC with Custom Pernsonal Permissions for Staff
- Rate Limiting with express-rate-limit
- Logger with morgan
- Docker for Containerization

# Getting Started

1. Clone the repository
   ```bash
   git clone repo-url
   cd project
   ```
2. Install the Dependencies
   ```bash
   npm install
   ```
3. Run

   ```bash
   # Update .env files
   # make sure your databaser server running
   # make sure your redish server is running

   # Run Developement Server
   # Create generated prisma client
   npx prisma generate
   # Database Migration
   npx prisma migrate dev --name init
   # Run The server
   npm run dev
   # Build
   npm run build
   # Copy
   cp generated\prisma\query_engine-windows.dll.node dist\generated\prisma\query_engine-windows.dll.node

   # Run in Production
   npm run start
   ```
