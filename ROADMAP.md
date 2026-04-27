# Production Information System — Roadmap

## What We're Building
A web-based MES (Manufacturing Execution System) for a plastics factory. It covers five factory sections:
- **Production** — machines, work orders, workers, reglers
- **Quality** — first-piece approval, in-process QC, batch release, non-conformance handling
- **Maintenance** — machine/tool service, fault tracking
- **Warehouse** — stock, items, delivery notes, lot traceability
- **HR / Personnel** — attendance tracking (NFC check-in/check-out), vacation planning, worker status
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
| Extended Person (RFID card, status, eligible positions) | US02-05-person-fields | Not started |
| Attendance tracking (check-in/check-out, credentials fallback) | US02-06-attendance-tracking | Not started |
| Tool / Mold (Alat) | US03-01-tool-crud | Not started |
| Item Master (unified: raw material, semi-finished, finished good) | US03-02-item-master-crud | Not started |
| BOM / Normative (Item → Item lines) | US03-03-bom-crud | Not started |
| Customer | US03-04-customer-crud | Not started |
| Packaging Unit (standard packaging types with images + instructions) | US03-05-packaging-unit-crud | Not started |
| Production Plan (simple) + Work Order system (incl. QC, batch release, NCR) | US04-00-production-plan-crud | Not started |
| Warehouse management (stock, receiving, reservations, shipments) | US05-01-warehouse-stock | Not started |
| Maintenance management (faults, service logs, schedules) | US06-01-machine-fault | Not started |
| PWA shell + NFC (attendance terminal, machine log-on) | US07-01-pwa-shell | Not started |
| Reporting & dashboards | US08-01-production-overview | Not started |
| Production Plan (MRP / advanced) | US09-01-demand-input | Not started (deferred — Phase 8) |

---

## Notes

- `MachineEquipment` = auxiliary equipment (robot arm, conveyor, boiler, dryer) attached to a main `Machine`. Keep naming explicit in code.
- `Tool` = Alat / mold — the die that produces an `Item`. One tool can run on multiple machines (compatibility is physics-based, not free-form).
- `Item` = unified material master covering everything with a factory code: raw thermoplastic, masterbatch, component, semi-finished injected part, finished good, regrind, packaging. Same item code can be output of one operation and input to the next.
- `BOMLine` = normative line linking output Item to input Item with quantity per piece. Replaces the old split between Material and ProductBOM.
- `PackagingUnit` ≠ `packaging` Item category. **PackagingUnit** is a reusable specification entity: it holds instructions and reference photos for *how* to pack a finished good (e.g. "Kesa 1400 kom" — fold top twice, seal with tape, label facing outward). **`packaging` Item category** is the physical consumable (bag, crate, label) that has a warehouse stock quantity and can appear in a BOM line (e.g. 1 bag consumed per 1400 pieces). A finished_good Item links to one PackagingUnit for packing instructions, and its BOM may include one or more `packaging` Items for stock consumption.

---

## Domain Model (entities and relationships)

```
JobPositionCategory
    └── JobPosition (Director, Planner, Regler, Worker, etc.)
            └── Person (can be trained for multiple JobPositions)
                    └── User (login credentials)

Machine
    ├── MachineEquipment[] (attached auxiliary equipment)
    ├── MachineAvailabilityStatus
    ├── Tool (currentToolId FK — added in US03-01 when Tool entity exists)
    └── Person (currentOperatorId FK — added in US04 when work order log-on exists)

Tool (Alat / Kalup)
    ├── Machine[] (compatible machines — derived from physical spec match)
    ├── Item[] (items this tool produces, via item → toolId FK)
    └── cavities (nr. of pieces per shot — determines production rate)

PackagingUnit (reusable packing spec — instructions + reference images)
    └── Item[] (finished_good items that use this packaging unit)

Item (unified material master — one code namespace for everything)
    ├── category: raw_material | masterbatch | component | semi_finished
    │             | finished_good | regrind | packaging
    ├── BOMLines[] (inputs needed to produce this item — any category can be input)
    ├── PackagingUnit (FK, nullable — finished_good only: how to pack + reference images)
    └── OperationSteps[] (injection → printing? → assembly? — drives WO sub-orders)

    Key rule: same item code can be OUTPUT of one operation and INPUT to the next.
    e.g. 132987 (semi_finished) = output of injection, input to printing → 132985 (finished_good)

ProductionPlan (Radni plan — simple container)
    ├── name / period (e.g. "April Week 3")
    └── WorkOrder[] (WOs assigned to this plan; WOs can also exist without a plan)

WorkOrder (Radni nalog)
    ├── Plan (FK ProductionPlan, nullable — ad-hoc WOs have no plan)
    ├── Machine
    ├── Tool
    ├── Item (the item being produced — must be semi_finished or finished_good)
    ├── MaterialReservations[] (from BOM × qty — held in WarehouseStock)
    └── SubOrders (see flow below)

WarehouseStock
    ├── Material stock (raw thermoplastics, masterbatch, components, regrind)
    │       └── MaterialLot[] (batch/lot traceability per delivery)
    └── Product stock (finished goods awaiting shipment)
           └── StockMovement[] (every in/out event)

DeliveryNote
    ├── Incoming (supplier → warehouse: increases Material stock)
    └── Outgoing (warehouse → customer: decreases Product stock)

MachineFault → MachineServiceLog (fault resolution + regular service history)
Tool → ToolServiceLog (lubrication, cleaning, repair per tool)
MaintenanceSchedule → (Machine | Tool) — planned interval tracker

Person
    ├── AttendanceRecord[] (one per working day — check-in/check-out)
    │       NFC tap at entrance terminal (Phase 6) or worker number/password fallback
    └── VacationRequest[] (pending | approved | rejected)
            └── VacationBalance (per year: entitled / used / pending / remaining)

Plan
    └── WorkOrder[] (plan generates work orders)
```

---

## Job Positions & System Access

| Job Position | Factory Section | Access |
|---|---|---|
| Admin | All | Full system access |
| Director | All | Read-only dashboard, real-time order/plan overview; approve vacation requests |
| Planner | Planning | All planning entities, create/manage plans and work orders |
| Shift Manager (Šef smene) | Production + HR | Work order overview, assign workers to machines; resolve production holds; approve/reject vacation requests; real-time attendance view (who is present on shift) |
| Tool Mounting Regler | Production | Tool mounting sub-order: select/mount tool, confirm PDF, confirm done |
| Machine Startup Regler | Production | All Tool Mounting Regler access + start machine in auto mode, log startup scrap |
| Transporter | Production | Material delivery sub-order for assigned machine |
| Production Worker | Production | NFC check-in at entrance; log on/off machine via NFC, confirm item PDF, log scrap + reason |
| Quality Controller (Kontrolor) | Production + Quality | First-piece approval after startup; hourly in-process checks + deviation log; issue/lift production hold; batch release sign-off (for items requiring qc_controller approval); raise and manage NCRs |
| Maintenance Worker | Maintenance | Log machine/tool fault, lubrication, cleaning, regular service |
| Maintenance Manager (Šef odrzavanja) | Maintenance | All maintenance + both regler access + update machine/tool PDFs |
| Warehouse Worker | Warehouse | Incoming item inspection (accept/reject delivery); create DeliveryNote + ItemLot; receive finished goods after batch release; record stock movements |
| Warehouse Manager (Šef magacina) | Warehouse | All warehouse worker access + create outgoing delivery notes + stock overview + low-stock alerts |
| Printing Worker | Production | Printing sub-order: start/end, piece count, scrap |
| Assembly Worker | Production | Assembly sub-order: start/end, piece count, scrap |
| Recycling Worker | Production | Recycling sub-order: grinder, start/end, output quantity and item class |
| Accountant / Bookkeeping | Planning + HR | Reports, financial data (scope TBD); monthly attendance export for payroll |

---

## Work Order Flow (dependency graph)

```
Planner creates Work Order (optional: inside a Plan) (Machine + Tool + Item + Quantity)
    │
    ├── [IMMEDIATE] Transporter sub-order
    │       Deliver items (raw material + packaging) to machine → confirm done
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
            Log startup scrap count (trial shots)
            ── [FIRST-PIECE APPROVAL] ──────────────────────────────────────
            │  QC Controller inspects trial pieces: dimensions, color, surface
            │  Approve → production starts   |   Reject → regler adjusts, repeat
            ────────────────────────────────────────────────────────────────
                │
                └── [BLOCKED: first-piece approved]
                    Production Worker sub-order
                        Log on with NFC card (or employee number)
                        Confirm item PDF read
                        Produce pieces (spans multiple shifts on same machine)
                        Log scrap + reason (Machine/Regler/Tool/Worker/Material/Aesthetics)
                            │
                            ├── [PARALLEL] QC sub-order — in-process
                            │       Hourly check: confirm worker on track
                            │       Log deviations: color, dimensions, packaging, material
                            │       Serious deviation → issue Production Hold
                            │           Machine status → hold; worker sees hold notification
                            │           Shift Manager resolves → hold lifted → production resumes
                            │           Deviation → NonConformanceRecord (NCR)
                            │               Decision: scrap | rework | ship-with-deviation
                            │               Rework → loops back into production
                            │               Scrap → quantity deducted → recycling sub-order
                            │
                            └── [BLOCKED: planned quantity reached]
                                ── [BATCH RELEASE GATE] ────────────────────────────────
                                │  Approver depends on item.approvalLevel:
                                │  • qc_controller → QC Controller inspects batch:
                                │      quantity accepted / quantity rejected
                                │      rejected qty → NCR → scrap or rework decision
                                │  • shift_manager  → Shift Manager confirms batch:
                                │      quantity confirmed, packaging OK
                                │  Either way: BatchReleaseRecord created, signed, timestamped
                                ────────────────────────────────────────────────────────
                                    │
                                    └── [BLOCKED: batch released]
                                        Warehouse sub-order
                                            Warehouse Worker receives released goods
                                            Verifies quantity matches BatchReleaseRecord
                                            Records finished_good stock increase
```

**Multi-shift note:** Each machine runs independently. A worker continues on their shift until planned quantity is done. New shift worker picks up the same active work order — no complex handover needed.

---

## Scrap Reasons (used across all sub-orders)
`Machine` | `Regler` | `Tool` | `Worker` | `Material` | `Aesthetics`

---

## Production Domain — Deep Analysis (from real factory data)

> Source files analyzed: `Podaci o mašinama.xlsx` (37 machines), `POPIS ALATA SIMIL 2024.ods` (90+ molds),
> `NORMATIV-NOVEMBAR 20.10.2017.xlsx` (BOM/normatives), `Mesecna realizacija proizvodnja Februar 2018.xlsx`
> (monthly production tracking), `IZRAČUN-SIMIL-03.2025-2.xlsm` (cost calculations — March 2025).

---

### Core Production Transformation Flow

```
RAW MATERIAL INPUT
  ├── Thermoplastic granules (PS, PA, ABS, PE — primary matrix)   [measured in grams/piece]
  └── Masterbatch (MB — color pigment concentrate)                [small grams/piece]

          │
          ▼
  [INJECTION MOLDING — brizganje]
  Tool/Mold (Kalup) mounted on Machine (Injection Press)
  — Tool has N cavities (gnezda) → N pieces per shot cycle
  — Cycle time (takt, seconds) determines production rate
  — Shot = N × piece_weight + runner/sprue_weight (ulivak)
          │
          ├── GOOD PIECES (dobri komadi) ────────────────────────────┐
          │                                                           │
          └── WASTE (runner + scrap) → Grinding/Recycling            │
                  └── Regrind material (secondary thermoplastic)      │
                                                                      ▼
                                         INJECTED PART (Brizgani komad)
                                                │
                               ┌────────────────┼──────────────────┐
                               │                │                  │
                        [ŠTAMPA]          [SKLOPOVI]         [PREDALI KPL]
                        Printing         Assembly            Drawer set assembly
                        (color/logo)    (2–4 injected       (multiple injected
                               │         parts + bought       parts assembled)
                               │         components)               │
                               ▼                ▼                  ▼
                        PRINTED PART      ASSEMBLY KPL       COMPLETE SET KPL
                        (šifra +                 (new šifra,        (new šifra,
                        color code)              suffix KPL)        suffix KPL)
```

---

### Item Categories

| Category | Examples | Unit | Notes |
|----------|----------|------|-------|
| `raw_material` | PS001 BK000, PS013 8K000, PA002 BK000, PA005 BK903, PE009 BK000, PA018, PA019, ABS009 BK777 | g | Primary injection matrix; purchased from supplier |
| `masterbatch` | MB363 BK087 (brown), various color codes | g | Color pigment concentrate added to thermoplastic in small qty; purchased |
| `component` | Springs (VZMET), screws (VIJAK), nuts (MATICA), clips, hinges | kom | Bought parts; assembled into KPL items |
| `semi_finished` | Injected parts before printing/assembly (e.g. 132987 VRATA PRED.) | kom | Output of injection; input to printing or assembly |
| `finished_good` | Printed parts, KPL assemblies, standalone injected parts ready to ship | kom | Final output; enters finished-goods stock; has PackagingUnit FK for packing instructions |
| `regrind` | Ground runners + defect parts from specific thermoplastic | g | Secondary material re-entered into production |
| `packaging` | Bags (kese), crates (gajbe), labels | kom | Physical consumable tracked in warehouse stock; appears in finished_good BOM lines. Not the same as PackagingUnit (see Notes) |

**Color code system** (suffix in item name — same item geometry, different masterbatch = different item code):
- `000` / `000A` = natural / white
- `006A` = light grey/white
- `031` = light grey
- `049`, `065`, `070` = medium grey
- `077` / `077/1` = beige/brown
- `087` / `090` = dark brown
- `777` = metallic grey
- `9005` = RAL9005 black

Same tool + different masterbatch = different item codes (5–10 codes per tool). The color suffix IS part of the item code name, not a separate field.

---

### BOM / Normative Structure

Each produced item (šifra) has a normative: how many grams (or pieces) of each input item are consumed per output piece.

```
Item 69229 (semi_finished — NOGA VISOKA)
  ├── BOMLine: input Item 19301 (raw_material, PS001 BK000): 10.09 g/piece
  └── BOMLine: input Item 312414 (masterbatch):               0.21 g/piece

Item 78233 (semi_finished — POKROV TEČAJA SPD)
  ├── BOMLine: input Item 19301 (raw_material, PS001 BK000): 20.99 g/piece
  └── BOMLine: input Item 355609 (masterbatch):               0.43 g/piece

Item 132985 (finished_good — VRATA PRED. printed variant)
  ├── BOMLine: input Item 132987 (semi_finished, injected part): 1 kom/piece
  └── BOMLine: input Item [ink/paint code] (component):         x g/piece

BOMLine table: (outputItemId, inputItemId, quantityPerPiece, unit)
  — unit is 'g' for plastics, 'kom' for components and semi-finished inputs
```

Key derived values tracked in production:
- `pieceWeight` — weight of final part (g), NOT counting runner
- `runnerWeight` (ulivak) — runner/sprue waste per shot cycle
- `totalShotWeight` = pieceWeight + runnerWeight (what normativ table calls `ukupno`)
- `cavities` (br. gnezda u alatu) — pieces per shot; production rate = cavities × (3600 / cycleSec)
- `normPerShift` — target pieces per 8h shift (from normativi sheet)

---

### Tool–Machine Compatibility Rules

From actual machine data, a tool can run on a machine ONLY IF:
1. Machine `clampingForce` ≥ tool `requiredClampingForceKN`
2. Tool `heightMM` BETWEEN machine `minMoldThickness` and `maxMoldThickness`
3. Tool `widthMM` ≤ machine `maxMoldWidth` AND tool `depthMM` ≤ machine `maxMoldHeight`
4. Tool `centeringDiameterMM` matches machine `centeringRingFixedSide` or `centeringRingMovingSide`

This means `ToolCompatibleMachines` is NOT a free-form relation — it is derived from the physical specs.
We should store the required specs on Tool and let the system validate compatibility.

Machine fields used for compatibility (all implemented in `US02-04`):
`clampingForce`, `maxMoldWidth`, `maxMoldHeight`, `minMoldThickness`, `maxMoldThickness`, `centeringRingFixedSide`, `centeringRingMovingSide`, `controlSystem`

Tool fields needed for compatibility:
`requiredClampingForceKN`, `heightMM`, `widthMM`, `depthMM`, `centeringDiameterMM`, `cavities` (gnezda)

---

### Multi-Operation Item Chains

Some items are produced through a sequence of operations, each step creating a new item code:

```
INJECTION (brizganje):         Item 132987  VRATA PRED.ZO6 V194 087      (semi_finished)
        │
        └── PRINTING (štampa): Item 132985  VRATA PRED.ZO6 V194 M2 087/090  (finished_good)
                                             (printed variant = new item code)

INJECTION (brizganje):         Item 376572  NOSILEC TEČAJA SPD 070        (semi_finished)
        │
        └── ASSEMBLY (KPL):    Item 376574  NOSILEC TEČAJA SPD KPL 070    (finished_good)
                                             (assembled with bought component ČEP TEČAJA)
```

**Implication for Work Orders**: A work order targets the final item code (finished_good). The item's `ItemOperationSteps[]` drives which sub-orders get created. Injection must complete before printing/assembly starts.

---

### Item Operations Enum

```
ItemOperation: 'injection' | 'printing' | 'assembly' | 'drawer_assembly'
```

Each produced item has a sequence of required operations stored as `ItemOperationSteps[]`. This drives which sub-orders are created when a Work Order is placed for that item.

---

### Recycling Loop

```
Scrap parts + runners (ulivci)
    → Grinding machine (Mlin Albis / Mlin TRIA / Mlin Plantas)
    → Regrind granulate
    → Re-enters warehouse as secondary material (lower grade)
    → Can be blended back into primary material at controlled % 
```

The recycling worker logs: input weight (kg) + item code → output weight of regrind.
This creates an `Item` record of category `regrind` linked to the original thermoplastic item.

---

## Planned Entity Field Specs

### Machine (main production machine)

**Implemented (`US02-04`):**
`id`, `name`, `machineNumber` (unique INTEGER — floor number), `serialNumber`, `description`, `yearOfManufacture`, `workPermit` (bool), `automaticMode` (bool), `semiAutomaticMode` (bool), `manualMode` (bool), `workHoursCounter`, `pieceCounter`, `scrapCounter`, `availabilityStatusId` (FK MachineAvailabilityStatus), `serviceInterval` (days between scheduled services), `lastServiceDone` (date), `pictures` (JSON array of file refs), `documents` (JSON array of file refs — specs, manuals, certificates), `createdBy`, `updatedBy`

Technical specs (for tool compatibility):
`clampingForce` (kN), `injectionWeight` (string, e.g. "850 gr"), `controlSystem`, `maxMoldWidth` (mm — tie bar spacing horizontal), `maxMoldHeight` (mm — tie bar spacing vertical), `maxMoldWeight` (kg), `minMoldThickness` (mm), `maxMoldThickness` (mm), `centeringRingFixedSide` (mm — fixed platen centering diameter), `centeringRingMovingSide` (mm — moving platen centering diameter)

**Planned — added when Tool and Person entities exist:**
`currentToolId` (FK Tool, nullable — tool currently mounted), `currentOperatorId` (FK Person, nullable — worker currently logged on)

Relations: MachineEquipment[], MachineServiceLog[] (serviceHistory), MaintenanceSchedule

### Tool (Alat / Kalup)
`id`, `inventoryNumber` (unique — matches SAP/ERP code e.g. 202601), `name`, `cavities` (gnezda — pieces per shot), `requiredClampingForceKN`, `heightMM`, `widthMM`, `depthMM`, `centeringDiameterMM`, `temperingTemperatures` (JSON: zone→{min,max}°C), `weight`, `image`, `pdfFile`, `status` (ok/fault/repair), `pieceCounter`, `serviceCategory` (S-1..S-4), `notes`

Relations: compatible machines (derived from specs), Item[] (items produced by this tool via item.toolId FK), lubrication/cleaning log

### Item (unified material master)
`id`, `itemCode` (unique — same 5–6 digit code namespace used across all types in the factory), `name`

`category`:
- `raw_material` — thermoplastic granules (PS001, PA002, ABS009 …)
- `masterbatch` — color pigment concentrate (MB363 BK087 …)
- `component` — bought parts (screws, springs, clips …)
- `semi_finished` — injected part before further processing (output of injection, input to printing/assembly)
- `finished_good` — final product ready for customer shipment
- `regrind` — ground scrap/runners re-entering as secondary material
- `packaging` — bags, crates, labels

`unit` (g | kg | kom | m | m2), `priceEurPerUnit` (for purchased items: raw_material, component), `pieceWeightG` (injection-molded items), `runnerWeightG` (sprue waste per shot), `packagingUnitId` (FK PackagingUnit, nullable — finished_good only), `piecesPerPackagingUnit` (e.g. 1400 — how many pieces fill one unit), `normPerShift` (target pieces per 8h shift — produced items), `toolId` (FK Tool, nullable — injection-molded items only), `approvalLevel` (`qc_controller` | `shift_manager` — who must sign batch release before goods enter warehouse; set per item type), `pdfFile`, `image`, `notes`

### PackagingUnit
`id`, `name` (e.g. "Kesa 1400 kom", "Gajba", "Kartonska kutija"), `description`, `images[]` (uploaded photos — shows what correct packing looks like), `instructions` (text — step-by-step packing procedure; shown to QC and warehouse workers during checks), `createdBy`, `updatedBy`

Used by: Item (finished_good) via `packagingUnitId` FK. QC Controller and Warehouse Worker see the instructions and reference images when performing in-process packaging checks and batch-release sign-off.

### BOMLine (normative — bill of materials, Item → Item)
`id`, `outputItemId` (FK Item — the item being produced), `inputItemId` (FK Item — what goes in; can be any category), `quantityPerPiece`, `unit`

One produced item has many BOM lines. Works for all operation chains:
- Injection: raw_material + masterbatch → semi_finished
- Printing: semi_finished → finished_good  
- Assembly: semi_finished + component(s) → finished_good (KPL)
- Recycling: semi_finished (scrap) → regrind

### ItemOperationStep
`id`, `itemId` (FK Item — the item being produced), `stepOrder` (1, 2, 3), `operation` (injection | printing | assembly | drawer_assembly)

Drives which sub-orders are created when a Work Order is placed for this item.

### ProductionPlan (simple container — Phase 3)
`id`, `planNumber` (unique), `name`, `periodType` (week | month | custom), `startDate`, `endDate`, `status` (draft | active | closed), `createdBy` (FK Person/Planner), `notes`

Relations: `WorkOrder[]` (all WOs assigned to this plan)

> Phase 8 MRP adds: demand inputs, material requirement lines, capacity check results — all as separate tables linked to this same Plan entity. No structural change to Plan or WorkOrder needed later.

### WorkOrder
`id`, `orderNumber` (unique), `planId` (FK ProductionPlan, **nullable** — null = ad-hoc/urgent), `machineId`, `toolId`, `itemId` (FK Item — must be category semi_finished or finished_good), `plannedQuantity`, `producedQuantity`, `status` (pending/in-progress/done/cancelled), `isUrgent` (bool), `plannedStartDate`, `plannedEndDate`, `createdBy` (FK Person/Planner)
Sub-order tables: `TransporterOrder`, `ToolMountingOrder`, `MachineStartupOrder`, `FirstPieceApproval`, `ProductionOrder`, `QCOrder`, `BatchReleaseRecord`, `WarehouseOrder`, `PrintingOrder`, `AssemblyOrder`, `RecyclingOrder`, `NonConformanceRecord`

### Warehouse entities

**WarehouseStock**
`id`, `itemId` (FK Item — any category can have stock), `quantityAvailable`, `quantityReserved`, `unit` (g | kg | kom), `minStockThreshold` (alert level), `location` (bin/shelf, optional)

**ItemLot** (batch traceability — primarily for raw_material and regrind)
`id`, `itemId` (FK Item), `lotNumber`, `quantityReceived`, `quantityRemaining`, `supplierName`, `deliveryDate`, `deliveryNoteId`

**StockMovement**
`id`, `itemId` (FK Item), `lotId` (nullable — for traceable items), `movementType` (receive_supplier | issue_to_production | receive_from_production | scrap_adjustment | return | outgoing_shipment), `quantity`, `unit`, `relatedOrderId` (FK WorkOrder or DeliveryNote), `performedBy` (FK Person), `timestamp`, `notes`

**DeliveryNote** (Dostavnica — both incoming and outgoing)
`id`, `direction` (incoming | outgoing), `documentNumber`, `supplierId | customerId`, `date`, `status` (draft | confirmed), `createdBy`, `lines[]` (itemId + qty)

**MinStockThreshold** — stored on WarehouseStock; alert fires when `quantityAvailable - quantityReserved < minStockThreshold`

---

### Maintenance entities

**MachineFault**
`id`, `machineId`, `reportedBy` (FK Person), `reportedAt`, `description`, `severity` (low | medium | high | critical), `status` (open | assigned | in_progress | resolved), `assignedTo` (FK Person — Maintenance Worker), `resolvedAt`, `resolution` (notes)

**MachineServiceLog**
`id`, `machineId`, `performedBy` (FK Person), `serviceType` (regular | repair | inspection | lubrication | cleaning), `date`, `durationMinutes`, `description`, `workOrderRef` (optional external ref), `nextScheduledDate`

**ToolServiceLog**
`id`, `toolId`, `performedBy` (FK Person), `serviceType` (regular | repair | lubrication | cleaning), `date`, `durationMinutes`, `pieceCounterAtService` (snapshot of tool cycle counter), `description`, `serviceCategory` (S-1 | S-2 | S-3 | S-4 — matches pricing category from tool card)

**MaintenanceSchedule**
`id`, `targetType` (machine | tool), `targetId`, `scheduleType` (by_hours | by_days), `intervalValue` (e.g. 500 hours or 30 days), `lastServiceDate`, `lastServiceHours`, `nextDueDate`, `nextDueHours` (auto-calculated), `isOverdue` (derived)

---

### Extended Person fields (to add)
`eligiblePositions` (junction table PersonJobPositions), `currentPositionId` (FK JobPosition), `status` (working | off | vacation | sick | break — auto-updated by check-in/check-out and approved vacation requests), `rfidCardNumber` (for NFC check-in and machine log-on)

---

### Attendance entities

**AttendanceRecord**
`id`, `personId` (FK Person), `date`, `checkInTime`, `checkInMethod` (nfc | worker_number | email_password), `checkOutTime` (nullable — null if still present), `checkOutMethod`, `totalHoursWorked` (derived: checkOut − checkIn), `status` (present | absent | late | left_early), `notes`

On check-in: `Person.status` → `working`. On check-out: `Person.status` → `off`.

**VacationRequest**
`id`, `personId` (FK Person), `type` (vacation | sick_leave | unpaid | other), `startDate`, `endDate`, `totalDays` (calculated, weekdays only), `status` (pending | approved | rejected | cancelled), `requestedAt`, `approvedBy` (FK Person — Shift Manager or Director), `approvedAt`, `rejectionReason`, `notes`

On approval: `Person.status` is set to `vacation` or `sick` for the covered dates.

**VacationBalance**
`id`, `personId` (FK Person), `year`, `totalEntitledDays`, `usedDays`, `pendingDays` (from pending requests), `remainingDays` (derived: entitled − used − pending)

---

## Build Order

### Phase 0 — Refactoring ✅ Done
- [x] Rename Workplace → JobPosition across DB, backend, frontend

### Phase 1 — Machine Equipment ✅ Done
- [x] `US02-03-machine-equipment-crud` — MachineEquipment CRUD + file upload

### Phase 2 — Core entities
- [ ] `US02-04-machine-crud` — Machine: clampingForce, injectionWeight, mold dimension limits (width/height/thickness/weight), centeringRing fixed+moving side, controlSystem, service interval + last service date; availability status FK; three operation mode booleans (automatic/semi-automatic/manual); work permit; counters (workHours, pieces, scrap); pictures + documents upload
- [ ] `US02-05-person-fields` — Extended Person (RFID card, status, eligible positions junction)
- [ ] `US02-06-attendance-tracking` — AttendanceRecord: check-in / check-out per worker per day; primary method: worker number or email + password (NFC enhancement added in Phase 6); `Person.status` auto-updates on check-in (→ working) and check-out (→ off); Shift Manager sees real-time present/absent view for their team
- [ ] `US03-01-tool-crud` — Tool / Mold (Alat): physical specs (height/width/depth, centering dia, cavities, required clamping force), tempering zones, piece counter, service category, docs
- [ ] `US03-02-item-master-crud` — Unified Item entity: code, name, category (raw_material/masterbatch/component/semi_finished/finished_good/regrind/packaging), unit, price; category-conditional fields (pieceWeightG, runnerWeightG, packagingUnitId FK, piecesPerPackagingUnit, normPerShift, toolId); replaces separate Material + Product tables
- [ ] `US03-03-bom-crud` — BOMLine (normative): per-item BOM lines (inputItemId + grams/piece); UI on item detail; covers all chains — injection, printing, assembly, recycling
- [ ] `US03-04-customer-crud` — Customer + basic order/shipment entities
- [ ] `US03-05-packaging-unit-crud` — PackagingUnit: standard reusable packaging types (bag, crate, box…); each unit has a name, description, piecesPerUnit (how many product pieces fit), images (upload), and packing instructions; linked to finished_good Items via FK; QC uses packaging unit instructions during in-process and batch-release checks

### Phase 3 — Production Plan (simple) + Work Order system
- [ ] `US04-00-production-plan-crud` — ProductionPlan CRUD: create a named plan with period (week/month/custom); Planner sees list of plans and can open one to work inside it. No MRP — just a container. WorkOrder gets a nullable `planId` FK from day one.
- [ ] `US04-01-work-order-core` — Work order creation (Planner: optionally inside a plan; machine + tool + part + qty); standalone WOs allowed for urgent/ad-hoc cases
- [ ] `US04-02-transporter-order` — Transporter sub-order (deliver material to machine)
- [ ] `US04-03-tool-mounting-order` — Tool mounting sub-order (with machine lock dependency)
- [ ] `US04-04-machine-startup-order` — Machine startup sub-order: configure settings, start auto mode, log startup scrap; ends with **first-piece approval** (QC Controller inspects trial pieces — approve or reject with adjustment loop; blocks production start)
- [ ] `US04-05-production-order` — Production worker sub-order (multi-shift, scrap logging)
- [ ] `US04-06-qc-order` — QC sub-order with three stages: (1) hourly in-process checks + deviation log; (2) production hold — QC issues hold on serious deviation, Shift Manager resolves; (3) **batch release** — QC Controller or Shift Manager (per `item.approvalLevel`) inspects finished batch, logs accepted/rejected qty, signs BatchReleaseRecord
- [ ] `US04-07-warehouse-order` — Warehouse receipt sub-order: **blocked until BatchReleaseRecord exists**; Warehouse Worker verifies quantity matches release record, records finished_good stock increase
- [ ] `US04-08-printing-order` — Printing sub-order (štampa): triggered when item has printing step; follows injection
- [ ] `US04-09-assembly-order` — Assembly sub-order (sklopovi/KPL): triggered when item has assembly step
- [ ] `US04-10-recycling-order` — Recycling sub-order: log runner + scrap weight in, regrind weight out; creates regrind Item stock
- [ ] `US04-11-non-conformance` — NonConformanceRecord (NCR): raised from QC deviation or batch release rejection; captures item, work order, batch, affected qty, description; decision workflow: scrap (→ recycling sub-order) | rework (→ loops back into production) | ship-with-deviation (requires Shift Manager approval + customer notification note)

### Phase 4 — Warehouse Management
- [ ] `US05-01-warehouse-stock` — WarehouseStock entity: current quantity per Item (any category); StockMovement log (every in/out event with type + reason)
- [ ] `US05-02-item-receiving` — Supplier delivery: Warehouse Worker creates DeliveryNote, assigns lot/batch number; **incoming inspection**: QC Worker accepts / conditionally accepts / rejects delivery (rejected lot quarantined — not available for reservation); ItemLot traceability
- [ ] `US05-03-item-reservation` — When Work Order is created, required input items (from BOMLine × qty) are reserved; reserved qty shown separately from available qty
- [ ] `US05-04-goods-issue` — Transporter picks up reserved items → StockMovement (issue_to_production); links to TransporterOrder in Work Order
- [ ] `US05-05-finished-goods-receipt` — After Work Order warehouse sub-order: Warehouse Worker receives finished_good items → stock increases
- [ ] `US05-06-outgoing-shipment` — Warehouse Manager creates outgoing DeliveryNote for customer shipment → finished_good stock decreases; links to CustomerOrder
- [ ] `US05-07-stock-overview` — Stock dashboard: current levels, reserved, available per Item; low-stock alerts (MinStockThreshold per Item); lot/batch search

### Phase 5 — Maintenance Management
- [ ] `US06-01-machine-fault` — Any worker reports machine fault (machine, description, severity); machine status auto-set to "fault"; Maintenance Manager assigns to worker
- [ ] `US06-02-machine-service-log` — Maintenance Worker logs service performed (machine, type: regular/repair/inspection, duration, date, notes); fault marked resolved; MachineServiceLog entry
- [ ] `US06-03-tool-service-log` — Tool/mold service: ToolServiceLog per event; lubrication/cleaning log per tool (date, worker, type); piece counter reset on service
- [ ] `US06-04-maintenance-schedule` — Planned service intervals per machine and per tool (by work hours or calendar days); system generates due reminders; Maintenance Manager confirms completion
- [ ] `US06-05-maintenance-dashboard` — Maintenance Manager view: open faults, scheduled services due, tool lubrication overdue; machine/tool status overview

### Phase 6 — PWA & NFC
- [ ] `US07-01-pwa-shell` — PWA shell (installable, mobile-first layout)
- [ ] `US07-02-nfc-login` — NFC card authentication for app login (Web NFC API, Android Chrome); same card used for attendance and machine log-on; fallback: worker number or email + password (same credentials used by attendance terminal in Phase 2)
- [ ] `US07-03-nfc-attendance` — NFC attendance terminal: worker taps card at entrance → check-in; taps again → check-out; upgrades US02-06 from credentials-only to NFC-primary with credentials fallback; terminal is a fixed Android tablet mounted at factory entrance
- [ ] `US07-04-nfc-machine-login` — NFC machine log-on: worker taps card at machine terminal to start production sub-order; same NFC infrastructure as attendance but different context (machine-bound, ties to active WorkOrder); fallback: worker number + password
- [ ] `US07-05-role-dashboards` — Role-specific dashboards (worker sees only their active sub-order)
- [ ] `US07-06-vacation-planning` — VacationRequest: worker submits request (type: vacation / sick / unpaid); Shift Manager or Director approves / rejects; approved requests auto-set Person.status for those dates; VacationBalance per worker per year (entitled / used / pending / remaining days); team vacation calendar view

### Phase 7 — Reporting & Dashboard
- [ ] `US08-01-production-overview` — Real-time production overview (Director/Planner)
- [ ] `US08-02-machine-counters` — Machine counters dashboard
- [ ] `US08-03-scrap-analysis` — Scrap analysis by reason / machine / worker
- [ ] `US08-04-warehouse-report` — Stock movement history, consumption per item, ItemLot traceability report
- [ ] `US08-05-maintenance-report` — Machine downtime analysis, fault frequency by machine/type, tool service history
- [ ] `US08-06-attendance-report` — Monthly attendance summary per worker (days present, late, absent, vacation used); export for payroll; Shift Manager view of team attendance history

### Phase 8 — Production Plan (MRP / advanced — deferred)
> Builds on the simple Plan container from Phase 3. Adds intelligence: material requirements, capacity scheduling, automated WO generation from demand. Needs Warehouse (Phase 4) and full BOM (Phase 2) to be operational first.
- [ ] `US09-01-demand-input` — Demand / customer orders as plan input (what to produce, by when, how many)
- [ ] `US09-02-material-requirements` — MRP: calculate required input items from demand × BOMLines; compare against WarehouseStock + open reservations; flag shortages per item
- [ ] `US09-03-plan-to-work-order` — Auto-generate Work Orders from plan: system proposes machine + tool assignment per product; Planner confirms
- [ ] `US09-04-capacity-check` — Machine capacity validation: planned WO hours vs. available machine hours per period
- [ ] `US09-05-plan-time-levels` — Plan time levels (monthly / weekly / daily / shift views)

---

## Deferred / Out of Scope for Now
- Energy consumption from hardware sensors (use calculated value for now)
- Native mobile apps (PWA first)
- Bookkeeping / financial module (scope TBD with customer)
- Automated MRP calculation (Phase 8)
- Spare parts inventory for maintenance (would be Item category `spare_part` — defer to Phase 5 follow-up)
- Supplier management (beyond DeliveryNote — contracts, lead times)
- Customer complaint management (defect reported on delivered goods → trace back to NCR / batch / ItemLot / work order / machine; needs full traceability chain operational first — defer to after Phase 5)
- External integrations (email import for purchase orders)