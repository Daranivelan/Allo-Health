# StockPulse — Allo Health Engineering Assignment

A real-time inventory reservation system built for the Allo Health Software Engineering Intern take-home exercise.

**Live Demo → [allo-health-orcin.vercel.app](https://allo-health-orcin.vercel.app)**

---

## The Problem

In e-commerce, a race condition exists at checkout: two users can simultaneously view the last available unit, both pass the stock check, and both complete payment — resulting in overselling. This system solves that with a time-boxed reservation layer.

## The Solution

When a user reserves a product, the system atomically locks the units for **10 minutes**. If payment is confirmed within that window, the units are permanently decremented. If the reservation expires or the user cancels, the units are immediately released back to available stock.

```
User clicks Reserve
  → Atomic SQL UPDATE checks stock AND increments reservedUnits in one statement
  → If two requests race for the last unit, exactly one wins — the other gets 409
  → Reservation created with 10-minute expiry
  → On confirm: totalUnits AND reservedUnits both decremented (unit is sold)
  → On cancel/expiry: only reservedUnits decremented (unit returns to stock)
```

---

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Framework  | Next.js 15 (App Router)      |
| Language   | TypeScript                   |
| Database   | PostgreSQL via Neon          |
| ORM        | Prisma 7 (pg driver adapter) |
| Auth       | Auth.js v5 (Google OAuth)    |
| Cache      | Upstash Redis                |
| Styling    | Tailwind CSS + shadcn/ui     |
| Deployment | Vercel                       |

---

## Key Technical Decisions

### Concurrency — Atomic SQL UPDATE

The core reservation logic uses a single atomic SQL statement that checks available stock and increments `reservedUnits` simultaneously:

```sql
UPDATE "Stock"
SET "reservedUnits" = "reservedUnits" + quantity
WHERE "productId"   = $1
  AND "warehouseId" = $2
  AND ("totalUnits" - "reservedUnits") >= quantity
```

If two requests race for the last unit, only one matches the `WHERE` clause. The other gets `rowsAffected = 0` → `409 Conflict`. This eliminates the race condition without requiring application-level locks.

### Stock Accounting

Two counters per warehouse:

- `totalUnits` — physical units in the warehouse
- `reservedUnits` — units currently held by PENDING reservations
- `availableUnits` — derived: `totalUnits - reservedUnits` (never stored directly)

On **confirm**: both `totalUnits` and `reservedUnits` are decremented (unit is sold permanently).
On **release**: only `reservedUnits` is decremented (unit returns to available stock).

### Reservation Expiry

Expired reservations are handled in two ways:

1. **Inline** — the confirm route checks `expiresAt` on every request and returns `410 Gone` if expired, auto-releasing the stock hold
2. **Background** — a Vercel cron job hits `/api/cron` daily to clean up any lingering PENDING reservations (Vercel hobby tier limitation; would run every minute on Pro)

### Authentication

Google OAuth via Auth.js v5 with Prisma adapter. Unauthenticated users can browse the full product catalogue. The login wall appears only when a user clicks Reserve — keeping friction minimal. Reservations are scoped to `userId` so users only see their own reservations.

### Trade-offs

- **Pessimistic vs Optimistic locking** — chose atomic UPDATE over `SELECT FOR UPDATE` (pessimistic). Simpler, fewer round-trips, and sufficient for this scale. Under very high contention with many retries, optimistic locking with versioning would be more performant.
- **Cron frequency** — runs daily on Vercel hobby tier. In production, this would run every minute via a dedicated worker or Vercel Pro.
- **No payment provider** — confirm is a direct API call simulating payment success. In production, this would be a webhook from Stripe/Razorpay.

---

## Data Model

```prisma
model Stock {
  productId     String
  warehouseId   String
  totalUnits    Int     // physical units
  reservedUnits Int     // currently held by PENDING reservations
  @@unique([productId, warehouseId])
}

model Reservation {
  status    ReservationStatus  // PENDING | CONFIRMED | RELEASED
  expiresAt DateTime
  userId    String?            // scoped to authenticated user
}
```

---

## API Routes

| Method | Route                            | Description                                 | Status Codes       |
| ------ | -------------------------------- | ------------------------------------------- | ------------------ |
| GET    | `/api/products`                  | Products with available stock per warehouse | 200                |
| GET    | `/api/warehouses`                | All warehouses                              | 200                |
| POST   | `/api/reservations`              | Reserve units with atomic stock lock        | 201, 400, 409      |
| POST   | `/api/reservations/[id]/confirm` | Confirm reservation                         | 200, 404, 409, 410 |
| POST   | `/api/reservations/[id]/release` | Release reservation early                   | 200, 404, 409      |
| GET    | `/api/cron`                      | Cleanup expired reservations (cron)         | 200, 401           |

---

## Local Setup

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database (free tier)
- A [Google Cloud](https://console.cloud.google.com) OAuth 2.0 Client ID

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Daranivelan/Allo-Health.git
cd Allo-Health
git checkout development

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your values (see below)

# 4. Generate Prisma client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev

# 6. Seed the database
npx prisma db seed

# 7. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Database (get from Neon dashboard → Connection string → Node.js)
DATABASE_URL="postgresql://..."

# Google OAuth (Google Cloud Console → APIs & Services → Credentials)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Auth.js
NEXTAUTH_SECRET="any-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"

# Cron protection
CRON_SECRET="any-random-string"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://your-vercel-url.vercel.app/api/auth/callback/google` (production)

### Useful Commands

```bash
npx prisma studio        # Visual DB browser at localhost:5555
npx prisma migrate dev   # Run after schema changes
npx prisma db seed       # Re-seed the database
```

---
