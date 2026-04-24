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

| Area | Branch | Status |
|------|--------|--------|
| Auth (JWT + refresh token, RBAC) | — | ✅ Done |
| Person management | — | ✅ Done |
| JobPosition / JobPositionCategory | — | ✅ Done (renamed from Workplace) |
| Machine Availability Statuses | US02-01-machine-availability-statuses | ✅ Done |
| Machine Equipment Types | US02-02-machine-equipment-types | ✅ Done |
| Machine Equipment (auxiliary — robot, boiler, conveyor) | US02-03-machine-equipment-crud | ✅ Done |
| Machine (main injection/production machine) | US02-04-machine-crud | Not started |
| Tool / Mold (Alat) | US03-01-tool-crud | Not started |
| Product / Part (Šifra komada) | US03-02-product-crud | Not started |
| Material | US03-03-material-crud | Not started |
| Customer | US03-04-customer-crud | Not started |
| Work Order system | US04-01-work-order-core | Not started |
| Production Plan | US05-01-production-plan | Not started (deferred — complex MRP) |

---

## Notes

- `MachineEquipment` = auxiliary equipment (robot arm, conveyor, boiler, dryer) attached to a main `Machine`. Keep naming explicit in code.
- `Tool` = Alat / mold — the die that produces a `Product`. One tool can run on multiple machines.
- `Material` = raw material input tracked in warehouse and linked to BOM.

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

### Phase 0 — Refactoring ✅ Done
- [x] Rename Workplace → JobPosition across DB, backend, frontend

### Phase 1 — Machine Equipment ✅ Done
- [x] `US02-03-machine-equipment-crud` — MachineEquipment CRUD + file upload

### Phase 2 — Core entities
- [ ] `US02-04-machine-crud` — Machine (main machine: fields, status, modes, service interval)
- [ ] `US02-05-person-fields` — Extended Person (RFID card, status, eligible positions junction)
- [ ] `US03-01-tool-crud` — Tool / Mold (Alat): dimensions, temps, piece counter, docs
- [ ] `US03-02-product-crud` — Product / Part (Šifra komada) + BOM
- [ ] `US03-03-material-crud` — Material (raw material: code, name, docs)
- [ ] `US03-04-customer-crud` — Customer + basic order/shipment entities

### Phase 3 — Work Order system
- [ ] `US04-01-work-order-core` — Work order creation (Planner: machine + tool + part + qty)
- [ ] `US04-02-transporter-order` — Transporter sub-order (deliver material to machine)
- [ ] `US04-03-tool-mounting-order` — Tool mounting sub-order (with machine lock dependency)
- [ ] `US04-04-machine-startup-order` — Machine startup sub-order + startup scrap log
- [ ] `US04-05-production-order` — Production worker sub-order (multi-shift, scrap logging)
- [ ] `US04-06-qc-order` — QC sub-order (parallel, hourly confirmation, deviations)
- [ ] `US04-07-warehouse-order` — Warehouse receipt sub-order
- [ ] `US04-08-other-sub-orders` — Printing, assembly, recycling sub-orders

### Phase 4 — PWA & NFC
- [ ] `US05-01-pwa-shell` — PWA shell (installable, mobile-first layout)
- [ ] `US05-02-nfc-login` — NFC card login (Web NFC API, Android Chrome)
- [ ] `US05-03-role-dashboards` — Role-specific dashboards (worker sees only active sub-order)

### Phase 5 — Reporting & Dashboard
- [ ] `US06-01-production-overview` — Real-time production overview (Director/Planner)
- [ ] `US06-02-machine-counters` — Machine counters dashboard
- [ ] `US06-03-scrap-analysis` — Scrap analysis by reason / machine / worker

### Phase 6 — Production Plan (deferred — complex MRP)
- [ ] `US07-01-plan-structure` — Master plan with sector sub-plans
- [ ] `US07-02-material-requirements` — Material requirements calculation from BOM + stock
- [ ] `US07-03-plan-to-work-order` — Plan → Work Order generation
- [ ] `US07-04-plan-time-levels` — Plan time levels (monthly / weekly / daily / shift)

---

## Deferred / Out of Scope for Now
- Energy consumption from hardware sensors (use calculated value for now)
- Native mobile apps (PWA first)
- Bookkeeping / financial module (scope TBD with customer)
- Automated MRP calculation (Phase 6)
- External integrations (email import for purchase orders)