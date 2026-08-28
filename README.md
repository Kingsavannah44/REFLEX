# Reflex Backend

Delivery coordination system for small Kenyan retailers.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL (via Knex.js)
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Validation:** Zod
- **Security:** Helmet, CORS, express-rate-limit

---

## Quick Start

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, QR_HMAC_SECRET
```

### 3. Create the database

```sql
CREATE DATABASE reflex_db;
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Seed test users

```bash
npm run seed
```

### 6. Start development server

```bash
npm run dev
```

Server starts at: `http://localhost:3000`

---

## Seeded Test Accounts

All passwords: `Password123!`

| Phone | Role | Name |
|---|---|---|
| +254711000001 | retailer_staff | Alice Wanjiru |
| +254711000002 | dispatcher | Brian Ochieng |
| +254711000003 | rider | Carol Muthoni |
| +254711000004 | rider | David Kamau |

---

## API Endpoints

### Health
```
GET /health
```

### Auth
```
POST /api/auth/login        → { phone, password }
POST /api/auth/refresh      → { refreshToken }
```

### Deliveries
```
POST   /api/deliveries              → retailer_staff: create delivery
GET    /api/deliveries/open         → dispatcher: list OPEN deliveries
GET    /api/deliveries/assigned     → rider: list own active deliveries
GET    /api/deliveries/:id          → any role: get delivery + history
PUT    /api/deliveries/:id/assign   → dispatcher: assign rider { riderId }
PUT    /api/deliveries/:id/status   → rider: update status { status, notes }
POST   /api/deliveries/:id/confirm  → rider: QR confirm delivery { qrToken }
```

### Riders
```
GET    /api/riders                  → dispatcher: list active riders
```

---

## Delivery Status Flow

```
OPEN → ASSIGNED → PICKED_UP → DELIVERED
OPEN → CANCELLED
ASSIGNED → CANCELLED
```

Invalid transitions return `400 Bad Request`.

---

## Golden Path (Demo Flow)

1. Login as Alice (retailer_staff) → `POST /api/auth/login`
2. Create delivery → `POST /api/deliveries`
3. Login as Brian (dispatcher) → `POST /api/auth/login`
4. View open deliveries → `GET /api/deliveries/open`
5. Get available riders → `GET /api/riders`
6. Assign Carol to delivery → `PUT /api/deliveries/:id/assign`
7. Login as Carol (rider) → `POST /api/auth/login`
8. View assigned deliveries → `GET /api/deliveries/assigned`
9. Mark picked up → `PUT /api/deliveries/:id/status` `{ "status": "PICKED_UP" }`
10. Confirm delivery (QR scan) → `POST /api/deliveries/:id/confirm` `{ "qrToken": "..." }`

---

## Project Structure

```
src/
├── config/
│   ├── database.ts       # Knex connection
│   ├── env.ts            # Typed environment variables
│   └── knexfile.ts       # Knex migration config
├── controllers/
│   ├── auth.controller.ts
│   └── delivery.controller.ts
├── database/
│   ├── migrations/       # Schema migrations
│   └── seeds/            # Test data
├── middleware/
│   ├── authenticate.ts   # JWT verification
│   ├── authorize.ts      # Role-based access control
│   ├── errorHandler.ts   # Global error handler
│   └── validate.ts       # Zod request body validation
├── repositories/
│   ├── delivery.repository.ts
│   └── user.repository.ts
├── routes/
│   ├── auth.routes.ts
│   ├── delivery.routes.ts
│   └── rider.routes.ts
├── services/
│   ├── auth.service.ts
│   └── delivery.service.ts
├── types/
│   └── index.ts          # Shared TypeScript types
├── utils/
│   ├── jwt.ts            # Token sign/verify
│   ├── qr.ts             # HMAC QR token generation
│   ├── response.ts       # Standardised API responses
│   └── stateMachine.ts   # Delivery status transitions
├── validators/
│   ├── auth.validators.ts
│   └── delivery.validators.ts
├── app.ts                # Express app setup
└── server.ts             # Bootstrap + graceful shutdown
```
