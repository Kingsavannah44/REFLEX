# Reflex - System Architecture & Technical Documentation

This repository contains the complete system design blueprint, trade-off analysis, visual architecture diagrams, and presentation deck for **Reflex**, a real-time delivery management system designed to replace unstructured WhatsApp coordination for small retail businesses.

## Repository Contents

* `docs/system-architecture.md`: Comprehensive System Blueprint, Data Schema, Workflow Logic, and 1-Page Trade-Off Log.
* `docs/demo-script.md`: 10-Minute Executive Presentation Script, Role-Based Demo Blueprint, and Practice Timing Logs.
* `docs/images/`: Visual System Architecture Diagrams (Mermaid SVG/PNG).
* `presentation/reflex-presentation.html`: Standalone 5-Slide Executive Pitch Deck.

## Core Architectural Overview

* **Frontend Specification:** Web-based Responsive Interface (HTML5/Tailwind CSS/JavaScript).
* **Backend Specification:** Event-driven RESTful API (Node.js/Express).
* **Database Schema:** Relational Schema (PostgreSQL/SQLite) enforcing ACID compliance.
* **Sync Strategy:** 5-Second HTTP Short Polling optimized for low data consumption on fluctuating 3G/4G networks.

Finalized System Architecture Document
1. Tech Stack Selection & Justification
Frontend: Responsive Web App (React)
o	Justification: Works across mobile (Android browsers for riders) and desktop (for retailers) without demanding app store downloads or app installations.
Backend: Node.js + Express REST API
o	Justification: Lightweight, event-driven, non-blocking asynchronous architecture that handles multiple status updates efficiently.
Database: SQLite / PostgreSQL
o	Justification: Relational database enforcing ACID compliance to prevent orphaned orders or lost rider assignments.
Data Syncing: Short HTTP Polling (5-second intervals)
o	Justification: Minimal mobile data usage, reliable execution on spotty 3G/4G networks across Kenya, and simple logic to maintain.
2. Complete Data Model Schema
USERS
├── user_id (Primary Key, UUID)
├── full_name (String)
├── phone_number (String)
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
3. System Workflow Logic & Boundaries
•	Retailer Workflow: Logs into the dashboard, inputs delivery details, and generates a pending order.
•	Dispatcher Workflow: Filters all pending orders, views active riders, and assigns a rider ID to update status to assigned.
•	Rider Workflow: Receives assigned task on their mobile screen, taps Mark Picked Up (picked_up), and scans a QR code/taps Confirm Delivery on arrival (delivered).
•	Offline/External Operations: Payment collections (cash/M-Pesa) and physical package han doffs occur externally. If mobile coverage drops, the app caches the status locally and pushes the payload once reconnected. 
Finalized 1-Page Trade-Off Log
Architecture Decision	Identified Weak Point / Compromise	"Acceptable Because..." Justification	Future Scalability Improvement
HTTP Short Polling vs. WebSockets	Higher server requests per minute; minor delay (up to 5 seconds) in state updates.	Acceptable because it eliminates persistent connection drops on weak 3G networks and reduces mobile data consumption for riders.	Migrate to WebSockets or Server-Sent Events (SSE) as network infrastructure scales.
Local State Auth vs. OAuth/JWT	Simplified role switching using local storage/session states instead of full multi-tenant token auth.	Acceptable because it allows clear end-to-end testing and demoing of cross-role workflows within tight sprint constraints.	Implement JWT (JSON Web Tokens) with role-based access control middleware.
Single Central Database vs. Distributed Cache	Database querying directly on every status update without a caching layer like Redis.	Acceptable because order volumes for neighborhood retail shops do not reach high-concurrency bottlenecks during initial operations.	Add a Redis caching layer for active rider session queries and open order queues.

