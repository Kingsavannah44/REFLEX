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