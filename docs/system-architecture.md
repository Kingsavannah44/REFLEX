# Reflex Delivery Platform - System Architecture & Design Document

## 1. Tech Stack Selection & Justification
* **Frontend:** React (Vite) + Tailwind CSS
  * *Justification:* Works across mobile (Android browsers for riders) and desktop (for retailers/dispatchers) without demanding app store downloads or app installations; component structure keeps three distinct role dashboards maintainable.
* **Backend:** Node.js + Express REST API (TypeScript), layered as routes → controllers → services → repositories
  * *Justification:* Lightweight, event-driven, non-blocking asynchronous architecture that handles multiple status updates efficiently; the layering keeps validation, business rules, and data access separately testable.
* **Database:** PostgreSQL, via Knex (query builder + migrations)
  * *Justification:* Relational database enforcing ACID compliance to prevent orphaned deliveries or lost rider assignments; migrations keep schema changes reviewable and repeatable across environments.
* **Auth:** JWT access tokens (15 min) + refresh tokens (7 days), bcrypt-hashed passwords
  * *Justification:* Stateless verification per request without a server-side session store; short-lived access tokens limit the blast radius of a leaked token, refresh tokens avoid forcing a re-login every 15 minutes.
* **Data Syncing:** Short HTTP Polling (5-second intervals)
  * *Justification:* Minimal mobile data usage, reliable execution on spotty 3G/4G networks, and simple logic to maintain.

---

## 2. Data Model Design

```text
USERS
├── id (Primary Key, UUID)
├── name (String)
├── phone (String, unique, used as login identifier)
├── email (String, unique, Nullable)
├── password_hash (String, bcrypt-hashed, never returned by the API)
├── role (Enum: 'retailer_staff', 'dispatcher', 'rider')
├── is_active (Boolean, default true)
├── created_at (Timestamp)
└── updated_at (Timestamp)

DELIVERIES
├── id (Primary Key, UUID)
├── created_by (Foreign Key -> USERS.id, the retailer who logged it)
├── assigned_rider_id (Foreign Key -> USERS.id, Nullable)
├── customer_name (String)
├── customer_phone (String)
├── delivery_address (Text)
├── item_description (Text)
├── status (Enum: 'OPEN', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED', default OPEN)
├── qr_token (String, unique, HMAC-signed - what the rider actually scans to confirm delivery)
├── assigned_at / picked_up_at / delivered_at (Timestamps, Nullable, one per milestone)
├── created_at (Timestamp)
└── updated_at (Timestamp)

DELIVERY_STATUS_HISTORY
├── id (Primary Key, UUID)
├── delivery_id (Foreign Key -> DELIVERIES.id)
├── changed_by (Foreign Key -> USERS.id)
├── previous_status / new_status (Enum, same values as DELIVERIES.status)
├── notes (Text, Nullable)
└── created_at (Timestamp), append-only audit log, no updated_at
```
