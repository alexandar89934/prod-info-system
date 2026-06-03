# Production Information System — Deploy Root

## Project Overview
Enterprise app for managing industrial operations: personnel, workplaces, and machine equipment with role-based access control (RBAC).

## Monorepo Structure
```
deploy/
  backend/    - Node.js + Express REST API
  frontend/   - React + Vite SPA
  tools/      - Dockerfiles, Nginx config, env files
```

## Development Environment
```bash
# Start full stack (from project root)
docker-compose up

# Services
# Nginx:      http://localhost (port 80)
# Frontend:   http://localhost:5173 (internal)
# Backend:    http://localhost:3000 (internal)
# PostgreSQL: localhost:5432
# Redis:      localhost:6379
```

## Feature Branch Convention
Branches follow `US<epic>-<story>` pattern (e.g. `US02-03`).

## Project Roadmap

### US01 — User Management
| Story | Status | Description |
|-------|--------|-------------|
| US01-01 | Done | App init: admin user, person, roles seeded from env vars |
| US01-02 | Done | RBAC, user management, profile create/update with roles |
| US01-03 | Done | Password change (old + new password) |
| US01-04 | Done | Workplace management CRUD |

### US02 — Machine Management
| Story | Status | Description |
|-------|--------|-------------|
| US02-01 | Done | Machine availability statuses (Running, Idle, Fault seeded) |
| US02-02 | Done | Machine equipment types CRUD |
| US02-03 | In Progress | Machine equipment CRUD with file uploads |
| US02-04 | Planned | Machine entity (links equipment + status + location) |

### US03 — Machine Entity (full)
| Story | Status | Description |
|-------|--------|-------------|
| US03-01 | Planned | Machine entity: ID, PDF card, image, accompanying equipment, tool list, worker list |
| US03-02 | Planned | Machine counters: work hours, piece count, scrap, energy consumption |
| US03-03 | Planned | Machine status: working/waiting/fault, auto/semi-auto/manual mode tracking |
| US03-04 | Planned | Machine service history, maintenance schedule, logged-in worker |

### US04 — Product & Tool Entities
| Story | Status | Description |
|-------|--------|-------------|
| US04-01 | Planned | Product (Šifra komada): part code, BOM, weight, material, packaging, PDF, image |
| US04-02 | Planned | Tool (Alat): compatible machines/products, dimensions, temperatures, status, service log |

### US05 — Work Order System (Radni nalog)
| Story | Status | Description |
|-------|--------|-------------|
| US05-01 | Planned | Work order creation: machine, tool, quantity |
| US05-02 | Planned | Sub-order: transporter (material delivery to machine) |
| US05-03 | Planned | Sub-order: tool mounting regler (mount/dismount tool, PDF confirmation) |
| US05-04 | Planned | Sub-order: machine startup regler (configure machine, start auto mode) |
| US05-05 | Planned | Sub-order: production worker (log on machine, produce, log scrap + reason) |
| US05-06 | Planned | Sub-order: quality control (hourly check, deviation tracking) |
| US05-07 | Planned | Sub-order: warehouse receipt (receive finished goods, verify stock) |
| US05-08 | Planned | Sub-orders for: assembly, printing, warehouse, loading/unloading, recycling |

### US06 — Planner
| Story | Status | Description |
|-------|--------|-------------|
| US06-01 | Planned | Master plan: monthly planning, stock check, material needs calculation |
| US06-02 | Planned | Sub-plans: production, printing, assembly, warehouse, maintenance, recycling |
| US06-03 | Planned | Plan levels: monthly → weekly → daily → shift |
| US06-04 | Planned | Raw material requisition plan, packaging plan |

### US07 — Warehouse Management
| Story | Status | Description |
|-------|--------|-------------|
| US07-01 | Planned | Stock management: item stock levels, lot/batch tracking, packaging unit registry |
| US07-02 | Planned | Incoming goods: receive raw materials, record supplier, link to purchase order |
| US07-03 | Planned | Production output receipt: receive finished goods from work order, link to production plan |
| US07-04 | Planned | Picking & delivery: collect items for a customer order, generate delivery note (otpremnica) |
| US07-05 | Planned | Stock query: where are items produced for a given order, which packaging units belong to a delivery |

#### Warehouse Traceability Design (agreed 2026-05-27)

**Order qty vs Plan qty are separate concepts — never auto-sync them.**
- Customer order line quantity = what the customer requested (contractual, frozen)
- Production plan quantity = batch size scheduled on a machine (can be larger, e.g. scrap buffer, combined run)
- Plan quantity changes do not update the order quantity

**Traceability chain:**
```
Packaging unit → Warehouse receipt → Production plan → Customer order line (informational context)
Delivery note  → Customer order   → picks N pieces from available stock (authoritative link)
```

**The delivery note (otpremnica) is the definitive "this piece belongs to this order" record**, not the production plan. The plan→order link is informational context ("this run was motivated by Order A"), not a hard allocation.

**Doubling the plan quantity is not a structural problem** because:
- All 20,000 received pieces carry "produced by Plan X (motivated by Order A)"
- When fulfilling Order A, the picking process selects 10,000 and stamps them on the delivery note
- The remaining 10,000 go to general stock; they are traceable to Plan X but not allocated to any order

**Future consideration:** if multiple customer orders need the same item in a single combined production run, add an `allocatedQuantity` field per plan→order link so each order's share is explicit.

### US01x — Time Tracking PWA
| Story | Status | Description |
|-------|--------|-------------|
| US01x-0x | Planned | Check-in / check-out screens, RFID card reader for new employee onboarding |

## Domain Glossary (Serbian → English)
| Serbian | English |
|---------|---------|
| Radni nalog | Work order |
| Šifra komada | Part code / SKU |
| Sastavnica | Bill of materials (BOM) |
| Planer | Production planner |
| Regler za podizanje | Tool mounting technician |
| Regler za pustanje | Machine startup technician |
| Transporter | Material transporter |
| Sef smene | Shift manager |
| Kontrolor | Quality controller |
| Magacin | Warehouse |
| Otpremnica | Delivery note / dispatch note |
| Skart | Scrap / reject parts |
| Nabavka | Procurement / purchasing |
| Sirovine | Raw materials |
| Poluproizvod | Semi-finished product |
| Reciklaza | Recycling (grinding scrap material) |
| Sneka (šneka) | Screw/extruder component |
| Alat | Tool / mold |
| Sifra | Code / identifier |

## Database
- PostgreSQL 14 with Sequelize migrations (migration files in `backend/migrations/`)
- Run migrations via entrypoint.sh on container start
- Seeders in `backend/seeders/`
- Table names use PascalCase quoted identifiers (e.g. `"MachineEquipment"`)
- Column names: camelCase quoted (e.g. `"serialNumber"`, `"createdAt"`)

## Auth
- JWT tokens (600s expiry) + refresh tokens in Redis (64800s / 18h)
- Token passed in request header as `token`
- Roles: Admin, Moderator, User