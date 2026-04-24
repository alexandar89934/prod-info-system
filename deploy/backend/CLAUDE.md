# Backend — Node.js + Express API

## Tech Stack
- Node.js 20, TypeScript, Express.js
- PostgreSQL 14 (raw SQL via `pg` Pool — no ORM mapping)
- Redis (refresh token storage)
- Joi (request validation)
- Pino (structured logging, passwords redacted)
- Multer (file uploads → `src/uploads/`)
- JWT + bcrypt (auth)
- Swagger (API docs)

## Architecture: controllers → services → models

```
src/
  controllers/     - HTTP request/response only, no business logic
  service/         - Business logic; each feature has *.service.ts + *.service.types.ts
  models/          - Raw SQL query functions only (callQuery wrapper)
  routes/api/      - Express routers, one file per feature
  middlewares/     - Auth/RBAC middleware (verifyToken, authorizeAdmin, etc.)
  shared/
    joi/           - Joi validation schemas (one per feature)
    error/         - Custom error classes: ApiError, AuthError, DBError, BaseError
    utils/         - CatchAsync, hash, tokenExtractor, file utilities
  infrastructure/  - db.ts (pg Pool), Redis client
  config/          - App config, logger, multerConfig
```

## Code Quality Rules — Non-Negotiable

### No `any` type — ever
- Never use `any` in TypeScript. Every value must have a real type.
- For catch blocks: use `unknown`, then cast with `error instanceof Error` or `error as Error`
- For Express error handlers: use `Error & { statusCode?: number }` (the `AnyError` alias already in `error.ts`)
- For Express middleware params: use `Request`, `Response`, `NextFunction` from express
- For `catchAsync` handlers: use the `AsyncHandler` type defined in `CatchAsync.ts`
- For SQL query params: use `(string | number | boolean | null | undefined | Date | object)[]`
- For model `params` arrays: use `(string | number)[]`

### No `eslint-disable` comments — ever
Fix the root cause instead of silencing the rule. Established patterns for common violations:
- `no-param-reassign` on `res.locals`: use `Object.assign(res.locals, { key: value })`
- `no-param-reassign` on Axios request config headers: use `reqConfig.headers.set('key', value)` (method call, not assignment)
- `no-underscore-dangle`: rename the property to one without leading/trailing underscores
- `react-hooks/exhaustive-deps`: stabilize the function with `useCallback` and use a `ref` for any state values that should not re-trigger the effect

## Conventions

### Controllers
- Wrap every handler in `catchAsync` — never use try/catch in controllers
- Respond with `{ success: true, message: "...", content: { ... } }` on success
- Respond with `{ success: false, message: "..." }` on error
- Use `httpStatus` constants (from `http-status` package) for all status codes
- Validate IDs from `req.params` before passing to service

### Services
- Throw `ApiError` (not generic Error) with appropriate HTTP status
- Always re-throw `ApiError` if caught in try/catch: `if (error instanceof ApiError) throw error`
- Unique constraint violations throw `httpStatus.CONFLICT` (409)
- Not found throws `httpStatus.NOT_FOUND` (404)
- Import query functions from the corresponding model file

### Models (SQL layer)
- Functions named `*Query` suffix (e.g. `createMachineEquipmentQuery`)
- Use parameterized queries (`$1, $2, ...`) — never string interpolation
- Table names: `"PascalCase"` quoted
- Column names: `"camelCase"` quoted for multi-word (e.g. `"serialNumber"`, `"createdAt"`)
- Whitelist sort fields explicitly before inserting into ORDER BY
- Use `callQuery<T>(sql, values, true)` for all DB calls
- Arrays/JSON fields: use `JSON.stringify()` before insert/update
- Use `RETURNING *` on INSERT/UPDATE/DELETE

### Validation
- Every route that accepts a body has a Joi schema in `src/shared/joi/`
- Schema files named `<feature>.schema.ts`
- Apply validation middleware on the router before the controller

### Routes
- Router files in `src/routes/api/`, exported and registered in `src/routes/api/index.ts`
- URL pattern: `/api/<resource>` (kebab-case, plural)
- CRUD pattern:
  - `GET    /`            → getAll (with pagination: page, limit, search, sortField, sortOrder)
  - `GET    /:id`         → getById
  - `POST   /create`      → create
  - `PUT    /update/:id`  → update
  - `DELETE /delete/:id`  → delete

### Error Classes
```ts
throw new ApiError("message", httpStatus.STATUS_CODE);
throw new AuthError("message");
throw new DBError("message");
```

### Logging
- Use `logger` from `src/config/logger.ts` (Pino)
- Never log passwords or tokens (redacted in config)

## Planned Entities (not yet implemented)

### Machine (Mašina)
Fields: `id`, `name`, `machineNumber`, `pdfCardFile`, `image`, `accompanyingEquipment` (robot, conveyor, boiler, vacuum, dryer — JSON array), `toolsList` (FK), `eligibleWorkers` (FK), `workHoursCounter`, `pieceCounter`, `scrapCounter`, `energyConsumption`, `status` (working/waiting/fault), `autoModeTime`, `semiAutoModeTime`, `toolChangeTime`, `startupTime`, `serviceHistory` (relation), `maintenanceSchedule`, `currentOperator` (FK Person), `motorStatus`, `heaterStatus`, `operationMode` (auto/semi-auto/manual), `workPermit`

### Product / Part (Šifra komada)
Fields: `id`, `partCode` (unique), `name`, `bom` (bill of materials — JSON/relation), `weight`, `material`, `toolName` (FK Tool), `pdfFile`, `packagingUnit`, `notes`, `image`

### Tool (Alat)
Fields: `id`, `name`, `producedParts` (FK array — part codes), `compatibleMachines` (FK array), `weight`, `dimensions`, `height`, `temperingTemperatures` (JSON), `image`, `pdfFile`, `status` (ok/fault/repair), `pieceCounter`, `lubricationLog` (relation), `scrapFromTool`, `notes`

### WorkOrder (Radni nalog)
Fields: `id`, `orderNumber`, `machineId` (FK), `toolId` (FK), `partCode` (FK), `quantity`, `plannedTime`, `status` (open/in-progress/done), `shiftManagerId` (FK), `createdAt`, `updatedAt`
Sub-orders (all FK to WorkOrder):
- `TransporterOrder` — material delivery, checklist confirmation
- `ToolMountingOrder` — regler mounts/dismounts tool, PDF read confirmation, completion flag
- `MachineStartupOrder` — regler configures machine, starts auto mode, startup scrap count
- `ProductionOrder` — worker logs on, piece counter, scrap log with reason
- `QualityControlOrder` — hourly confirmation, deviation log (aesthetics, color/code, material, packaging, dimensions)
- `WarehouseReceiptOrder` — goods received by warehouse, stock verification
- `OtherOrder` — assembly, printing, loading/unloading, recycling

### Plan (Plan / Radni plan)
Structure: Master Plan → sector sub-plans (Production, Printing, Assembly, Warehouse, Maintenance, Recycling)
Time levels: Monthly → Weekly → Daily → Shift
Key sub-plans:
- Production plan: machine assignment, worker schedule, regler schedule, tool change plan
- Warehouse plan: incoming materials, outgoing goods, delivery notes
- Maintenance plan: regular + emergency service for machines and tools
- Raw material requisition plan
- Recycling plan: material type, grinder assignment, output class (first class, second class, multiple grinds, extruder cleaning, sale, unusable)

### Extended Person Fields (to be added)
Additional fields beyond current implementation: `eligiblePositions` (JSON array of workplace IDs), `currentPosition` (FK Workplace), `workSchedule` (shift assignment), `status` (working/not-working/vacation/sick/break), `monthlyWorkHours`, `monthlyWorkDays`, `scrapCount`, `hoursPerPosition` (JSON — hours by position per day/week/month)

### Scrap (Skart) — reasons enum
`machine` | `regler` | `tool` | `worker` | `material` | `aesthetics`

## Business Rules

### App Initialization (first launch)
- On first launch, seed from environment variables: create admin User + linked Person record
- Populate Roles table with exactly three roles: `Admin`, `Moderator`, `User`
- Assign all three roles to the first created admin user

### RBAC Rules
- Every user must have at least one role and at least one workplace assigned
- Only Admin role can modify the roles of other users
- Non-admin users can only edit their own profile (`authorizeAdminOrSelf` middleware)
- **At least one user with Admin role must exist at all times** — deleting the last admin must return an error

### User / Person Deletion
- Deleting a user must also delete the associated Person record (cascade or explicit)
- Block deletion if the user is the last remaining Admin

### File / Image Rules
- When a new profile image or equipment image is uploaded, the previous file must be deleted from disk
- Option to remove profile image must be supported (set to null, delete file)

### Date Validation
- End date must not be earlier than start date (enforced in Joi schemas)

### Machine Availability Statuses
- Seeded with three default values: `Running`, `Idle`, `Fault`
- Managed from the Machine page — not a top-level sidebar item

### Work Order Flow (sequential)
1. Planner creates work order (machine, tool, part code, quantity)
2. Transporter delivers material to machine → confirms delivery
3. Tool mounting regler: selects tool to remove/mount, confirms PDF read, confirms mount complete
4. Machine startup regler: configures machine, confirms startup, logs startup scrap count
5. Worker logs onto machine, confirms PDF read for part code, starts producing, logs scrap + reason
6. Quality controller: confirms worker completed each hour, checks for deviations (color, dims, packaging, material)
7. When a shift is done and QC confirmed: warehouse receives completed goods and verifies stock
8. Work order spans multiple shifts until quantity is fulfilled

### RBAC — Planned Roles and Their Permissions
| Role | Key Permissions |
|------|----------------|
| Admin | Full access |
| Director | Read-only on all entities, real-time plan/order visibility |
| Planner | All entities needed for planning; creates/manages plans and work orders |
| Maintenance Worker | Mark machine/tool fault, log lubrication/cleaning, log regular service |
| Maintenance Manager | All maintenance worker perms + both regler perms + update machine/tool PDFs |
| Tool Mounting Regler | View machine, select tool, confirm PDF read, confirm mount complete |
| Machine Startup Regler | Tool mounting regler perms + start machine in auto mode, log startup scrap |
| Transporter | View work order material requirements, confirm material delivery |
| Shift Manager | View work orders, create machine/position schedule, assign workers |
| Production Worker | Log on/off machine, confirm part code PDF, log piece count and scrap with reason |
| Warehouse Worker | Input raw materials stock, receive production output, receive incoming parcels |
| Warehouse Manager | Warehouse worker perms + manage work schedule + create delivery notes (otpremnice) |
| Quality Controller | Confirm worker output per hour, confirm goods entry/exit, random sampling check |
| Printing Worker | Log printing work order start/end, input piece count and scrap |
| Assembly Worker | Log assembly work order start/end, input assembled count and scrap |
| Recycling Worker | Log grinder assignment, start/end time, output quantity and material class |

## File Uploads
- Multer config in `src/config/multerConfig.ts`
- Uploaded files stored in `src/uploads/`
- File paths stored as JSON arrays in `documents` and `pictures` columns

## Adding a New Feature Checklist
1. Migration file in `migrations/`
2. Model file: `src/models/<feature>.model.ts` (Query functions)
3. Service types: `src/service/<feature>.service.types.ts`
4. Service: `src/service/<feature>.service.ts`
5. Controller: `src/controllers/<feature>.controller.ts`
6. Joi schema: `src/shared/joi/<feature>.schema.ts`
7. Router: `src/routes/api/<feature>.router.ts`
8. Register in `src/routes/api/index.ts`
9. Export controller from `src/controllers/index.ts`
10. Export service from `src/service/index.ts`