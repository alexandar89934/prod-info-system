# Production Information System — Roadmap

## What We're Building
A web-based MES (Manufacturing Execution System) for a plastics factory. It covers four factory sections:
- **Production** — machines, work orders, workers, reglers
- **Maintenance** — machine/tool service, fault tracking
- **Warehouse** — stock, materials, delivery notes
- **Planning / Bookkeeping** — production plans, schedules, reporting

The app is **role-based**: every screen shows only what is relevant to the logged-in worker's job position. Primary interface is a **PWA** (works on phones/tablets next to machines). Native apps are a future consideration.

Worker authentication: **NFC card** (primary) + employee number/password (fallback).

---

## Current State (what exists)

| Area | Status |
|------|--------|
| Auth (JWT + refresh token, RBAC) | Done |
| Person management | Done |
| Workplace → **needs rename to JobPosition** | Done (wrong name) |
| WorkplaceCategory → **needs rename** | Done (wrong name) |
| Machine Availability Statuses | Done |
| Machine Equipment Types | Done |
| Machine Equipment (auxiliary, e.g. robot, boiler, conveyor) | In progress (US02-03) |
| Machine (main injection/production machine) | Not started |
| Tool (Alat / mold) | Not started |
| Product / Part (Šifra komada) | Not started |
| Work Order system | Not started |
| Production Plan | Not started (deferred — complex MRP) |

---

## Refactoring Required (before new features)

### 1. Rename Workplace → JobPosition
`Workplace` was built as a physical location but the actual requirement is **job position** (Regler, Transporter, Production Worker, etc.).

Scope of change:
- DB: migration to rename `Workplaces` → `JobPositions`, `WorkplaceCategories` → `JobPositionCategories`, `EmployeeWorkplaces` → `PersonJobPositions`
- Backend: rename models, services, controllers, routes, Joi schemas
- Frontend: rename Redux slices, scenes, Zod schemas, sidebar links

### 2. MachineEquipment naming note
`MachineEquipment` is correctly used for **auxiliary equipment** (robot arm, conveyor belt, boiler, vacuum, dryer) that supports a main machine. The upcoming `Machine` entity is the main production machine. No rename needed, but always be explicit in code comments to avoid confusion.

---

## Domain Model (entities and relationships)

```
JobPositionCategory
    └── JobPosition (Director, Planner, Regler, Worker, etc.)
            └── Person (can be trained for multiple JobPositions)
                    └── User (login credentials)

Machine
    ├── MachineEquipment[] (attached auxiliary equipment)
    ├── Tool (currently mounted mold)
    ├── MachineAvailabilityStatus
    └── Person (currently logged-in worker)

Tool (Alat / mold)
    ├── Machine[] (machines it can run on)
    └── Product[] (parts it produces)

Product (Šifra komada)
    ├── Tool (mold that makes it)
    └── BOM[] (bill of materials — raw materials + semi-finished parts needed)

WorkOrder (Radni nalog)
    ├── Machine
    ├── Tool
    ├── Product (part code + quantity)
    └── SubOrders (see flow below)

Plan
    └── WorkOrder[] (plan generates work orders)
```

---

## Job Positions & System Access

| Job Position | Factory Section | Access |
|---|---|---|
| Admin | All | Full system access |
| Director | All | Read-only dashboard, real-time order/plan overview |
| Planner | Planning | All planning entities, create/manage plans and work orders |
| Shift Manager (Šef smene) | Production | Work order overview, assign workers to machines |
| Tool Mounting Regler | Production | Tool mounting sub-order: select/mount tool, confirm PDF, confirm done |
| Machine Startup Regler | Production | All Tool Mounting Regler access + start machine in auto mode, log startup scrap |
| Transporter | Production | Material delivery sub-order for assigned machine |
| Production Worker | Production | Log on/off machine, confirm part PDF, log scrap + reason |
| Quality Controller (Kontrolor) | Production | Hourly confirmation, deviation entry, goods entry/exit approval |
| Maintenance Worker | Maintenance | Log machine/tool fault, lubrication, cleaning, regular service |
| Maintenance Manager (Šef odrzavanja) | Maintenance | All maintenance + both regler access + update machine/tool PDFs |
| Warehouse Worker | Warehouse | Input raw materials, receive production output, incoming parcels |
| Warehouse Manager (Šef magacina) | Warehouse | All warehouse worker + work schedule + create delivery notes |
| Printing Worker | Production | Printing sub-order: start/end, piece count, scrap |
| Assembly Worker | Production | Assembly sub-order: start/end, piece count, scrap |
| Recycling Worker | Production | Recycling sub-order: grinder, start/end, output quantity and material class |
| Accountant / Bookkeeping | Planning | Reports, financial data (scope TBD) |

---

## Work Order Flow (dependency graph)

```
Planner creates Work Order (Machine + Tool + Part Code + Quantity)
    │
    ├── [IMMEDIATE] Transporter sub-order
    │       Deliver material + packaging to machine → confirm done
    │
    ├── [BLOCKED: previous work order's tool must be unmounted first*]
    │   Tool Mounting Regler sub-order
    │       Select tool to remove, select tool to mount
    │       Confirm PDF read → confirm mount complete
    │
    │   * Exception: urgent orders can override with explicit confirmation
    │
    └── [BLOCKED: tool mounting done]
        Machine Startup Regler sub-order
            Configure machine settings
            Confirm ready → start auto mode
            Log startup scrap count
                │
                └── [BLOCKED: startup confirmed]
                    Production Worker sub-order
                        Log on with NFC card (or employee number)
                        Confirm part code PDF read
                        Produce pieces (spans multiple shifts on same machine)
                        Log scrap + reason (Machine/Regler/Tool/Worker/Material/Aesthetics)
                            │
                            ├── [PARALLEL] QC Controller sub-order
                            │       Hourly confirmation that worker is on track
                            │       Log deviations: color, dimensions, packaging, material
                            │
                            └── [BLOCKED: QC confirms batch complete]
                                Warehouse sub-order
                                    Receive finished goods
                                    Verify and record stock count
```

**Multi-shift note:** Each machine runs independently. A worker continues on their shift until planned quantity is done. New shift worker picks up the same active work order — no complex handover needed.

---

## Scrap Reasons (used across all sub-orders)
`Machine` | `Regler` | `Tool` | `Worker` | `Material` | `Aesthetics`

---

## Planned Entity Field Specs

### Machine (main production machine)
`id`, `name`, `machineNumber` (unique), `pdfCard` (file), `image`, `notes`, `workHoursCounter`, `pieceCounter`, `scrapCounter`, `energyConsumption` (auto: machine power × hours — analytics, low priority), `currentStatus` (FK MachineAvailabilityStatus), `currentTool` (FK Tool, nullable), `currentOperator` (FK Person, nullable), `operationMode` (auto/semi-auto/manual), `workPermit` (bool), `serviceHistory` (relation), `maintenanceSchedule` (relation)

### Tool (Alat / mold)
`id`, `name`, `serialNumber`, `weight`, `dimensions`, `height`, `temperingTemperatures` (JSON: min/max per zone), `image`, `pdfFile`, `status` (ok/fault/repair), `pieceCounter`, `notes`
Relations: compatible machines, produced part codes, lubrication/cleaning log

### Product / Part (Šifra komada)
`id`, `partCode` (unique), `name`, `weight`, `material`, `packagingUnit`, `pdfFile`, `image`, `notes`
Relations: tool (mold), BOM (raw materials + semi-finished inputs)

### WorkOrder
`id`, `orderNumber` (unique), `machineId`, `toolId`, `partCode`, `plannedQuantity`, `producedQuantity`, `status` (pending/in-progress/done/cancelled), `isUrgent` (bool), `plannedStartDate`, `plannedEndDate`, `createdBy` (FK Person/Planner)
Sub-order tables: `TransporterOrder`, `ToolMountingOrder`, `MachineStartupOrder`, `ProductionOrder`, `QCOrder`, `WarehouseOrder`

### Extended Person fields (to add)
`eligiblePositions` (junction table PersonJobPositions), `currentPositionId` (FK JobPosition), `status` (working/off/vacation/sick/break), `rfidCardNumber` (for NFC login)

---

## Build Order

### Phase 0 — Refactoring (do first)
- [ ] Rename Workplace → JobPosition across DB, backend, frontend

### Phase 1 — Finish current work (US02-03)
- [ ] Complete Machine Equipment CRUD + file upload (branch US02-03)

### Phase 2 — Core entities
- [ ] US02-04: Machine entity (main machine with full fields)
- [ ] US03-01: Tool entity (Alat)
- [ ] US03-02: Product/Part entity (Šifra komada) + BOM
- [ ] Extended Person fields (RFID number, status, eligible positions)

### Phase 3 — Work Order system
- [ ] US04-01: Work order creation (Planner)
- [ ] US04-02: Transporter sub-order
- [ ] US04-03: Tool mounting sub-order (with machine lock dependency)
- [ ] US04-04: Machine startup sub-order
- [ ] US04-05: Production worker sub-order (multi-shift, scrap logging)
- [ ] US04-06: QC sub-order (parallel, hourly confirmation, deviations)
- [ ] US04-07: Warehouse receipt sub-order
- [ ] US04-08: Other sub-orders (printing, assembly, recycling)

### Phase 4 — PWA & NFC
- [ ] US05-01: PWA shell (installable, mobile-first layout)
- [ ] US05-02: NFC card login (Web NFC API, Android Chrome)
- [ ] US05-03: Role-specific dashboards (worker sees only their active sub-order)

### Phase 5 — Reporting & Dashboard
- [ ] US06-01: Real-time production overview (polling, Director/Planner)
- [ ] US06-02: Machine counters dashboard
- [ ] US06-03: Scrap analysis by reason/machine/worker

### Phase 6 — Plan (deferred — complex MRP)
- [ ] US07-01: Master plan with sector sub-plans
- [ ] US07-02: Material requirements calculation from BOM + stock
- [ ] US07-03: Plan → Work Order generation
- [ ] US07-04: Plan time levels (monthly/weekly/daily/shift)

---

## Deferred / Out of Scope for Now
- Energy consumption from hardware sensors (use calculated value for now)
- Native mobile apps (PWA first)
- Bookkeeping / financial module (scope TBD with customer)
- Automated MRP calculation (Phase 6)
- External integrations (email import for purchase orders)