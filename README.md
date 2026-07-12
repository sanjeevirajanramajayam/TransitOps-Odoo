# TransitOps Platform

TransitOps is a modern transit operations management platform built for vehicle fleet tracking, driver compliance monitoring, automated trip dispatches, and financial log summaries.

---

## 1. Project Architecture

The repository is structured as a monorepo containing two main packages:

```
├── backend/            # Node.js TypeScript API
│   ├── prisma/         # Prisma ORM schemas and migrations
│   ├── src/            # Source code (index.ts, db.ts, etc.)
│   ├── tsconfig.json   # TypeScript configuration
│   └── package.json    # Backend scripts and dependencies
│
└── frontend/           # React + Vite Client
    ├── src/            # Component tree (components/ui, lib/utils)
    ├── tailwind.config.cjs  # Tailwind configuration
    ├── components.json # Shadcn/ui configurations
    └── package.json    # Frontend scripts and dependencies
```

### Tech Stack
* **Backend**: Node.js + Express in **TypeScript**, executed via **tsx** (with nodemon), validating payloads with **Zod**, and talking to PostgreSQL with **Prisma ORM**.
* **Frontend**: React (Vite) styled with **Tailwind CSS v3** and **Shadcn/ui** components.

---

## 2. Installation & Setup Instructions

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### Setup the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Configure your Environment Variables:
   Create a `.env` file in the root of the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require
   ```

4. Database Sync & Generation:
   Generate the local Prisma Client types:
   ```bash
   npx prisma generate
   ```
   Apply migrations to sync the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the API Development Server:
   ```bash
   npm run dev
   ```
   The backend server runs on `http://localhost:5000`.

---

### Setup the Frontend

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```

2. Install all dependencies:
   *Note: Using `--legacy-peer-deps` is recommended to prevent peer conflicts on React 19.*
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the Vite Dev Server:
   ```bash
   npm run dev
   ```
   The frontend will run locally (typically at `http://localhost:5173`).

---

## 3. Development Commands

### Backend
* `npm run dev`: Runs the TypeScript server using `tsx` and hot-reloading with `nodemon`.
* `npm run build`: Compiles TypeScript source files into `dist/`.
* `npm run start`: Runs the pre-compiled JavaScript server from `dist/index.js`.
* `npm run prisma:generate`: Re-runs Prisma generator.
* `npm run prisma:migrate`: Creates and runs database migrations.
* `npm run prisma:studio`: Launches Prisma GUI to explore database records (accessible on `http://localhost:5555`).

### Frontend
* `npm run dev`: Runs Vite dev server.
* `npm run build`: Bundles the React assets for production.
* `npm run preview`: Previews the production build locally.
