# Reflex Delivery Platform - System Architecture & Design Document

## 1. Tech Stack Selection & Justification
* **Frontend:** Responsive Web App (HTML5, Tailwind CSS, Vanilla JavaScript)
  * *Justification:* Works across mobile (Android browsers for riders) and desktop (for retailers) without demanding app store downloads or app installations.
* **Backend:** Node.js + Express REST API
  * *Justification:* Lightweight, event-driven, non-blocking asynchronous architecture that handles multiple status updates efficiently.
* **Database:** SQLite / PostgreSQL
  * *Justification:* Relational database enforcing ACID compliance to prevent orphaned orders or lost rider assignments.
* **Data Syncing:** Short HTTP Polling (5-second intervals)
  * *Justification:* Minimal mobile data usage, reliable execution on spotty 3G/4G networks, and simple logic to maintain.

---

## 2. Data Model Design

```text
USERS
├── user_id (Primary Key, UUID)
├── full_name (String)
├── phone_number (String, unique, used as login identifier)
├── password_hash (String, bcrypt-hashed, never returned by the API)
└── role (Enum: 'retailer', 'dispatcher', 'rider')

ORDERS
├── order_id (Primary Key, UUID)
├── customer_name (String)
├── customer_phone (String)
├── delivery_address (Text)
├── item_description (Text)
├── status (Enum: 'pending', 'assigned', 'picked_up', 'delivered')
├── created_by (Foreign Key -> USERS.user_id)
├── assigned_rider (Foreign Key -> USERS.user_id, Nullable)
├── created_at (Timestamp)
└── updated_at (Timestamp)