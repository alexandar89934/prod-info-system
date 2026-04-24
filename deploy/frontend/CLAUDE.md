# Frontend — React + Vite SPA

## Tech Stack
- React 18, TypeScript, Vite
- Redux Toolkit (state management)
- Material-UI v6 (MUI) + Emotion
- Tailwind CSS v4
- React Hook Form + Zod (forms & validation)
- React Router v6
- i18next (internationalization)
- Sentry (error tracking)
- Axios (HTTP client, configured in `src/services/axios.service.ts`)

## Directory Structure

```
src/
  scenes/              - Page-level components (one folder per feature/domain)
    dashboard/
    login/
    layout/
    personManagement/
    workplaceManagement/
    workplaceCategoryManagement/
    machineManagement/
      machineEquipment/
      machineAvailabilityStatus/
      machineEquipmentTypes/
  state/               - Redux store, one folder per feature
    auth/
    person/
    workplace/
    workplaceCategory/
    machineEquipment/
    machineAvailabilityStatus/
    machineEquipmentTypes/
    fileUploads/
    theme/
    role/
    reducer.ts         - combineReducers
    store.ts           - configureStore
  reusableComponents/  - Shared UI (Navbar, Sidebar, Header, ImageGallery, DateField, etc.)
  zodValidationSchemas/ - Zod schemas, one file per feature
  services/            - Axios instance setup
  config/              - Frontend config
  assets/              - Static assets
  theme.tsx            - MUI theme configuration
```

## Code Quality Rules — Non-Negotiable

### No `any` type — ever
- Never use `any` in TypeScript. Every value must have a real type.
- For catch blocks: use `unknown`, then cast — `const err = error as AxiosError<{ message?: string }>` for Axios errors, `const err = error as Error` for generic errors
- For Redux action catch blocks: cast to `AxiosError` with a typed response data generic (e.g. `AxiosError<{ error?: { message?: string }; message?: string }>`)
- For `react-hook-form` `Control`: use the concrete form data type (e.g. `Control<PersonFormDataBase>`); for reusable components that accept any form, use `Control<FieldValues>`
- For MUI DataGrid `renderCell`: use `GridRenderCellParams<RowType>` from `@mui/x-data-grid`
- For MUI Select `onChange`: use `(event: SelectChangeEvent<T>) => void`
- For form error casts: use `as FieldError` — never `as any`
- For Redux state: never store `Date` objects — use ISO strings instead
- For pointer event handlers: use concrete element types like `React.PointerEventHandler<HTMLButtonElement>` — not `<any>`
- For dispatched thunk results: cast `result.payload as string` — not `(result as any).payload`

### No `eslint-disable` comments — ever
Fix the root cause instead of silencing the rule. Established patterns for common violations:
- `no-param-reassign` on `res.locals`: use `Object.assign(res.locals, { key: value })`
- `no-param-reassign` on Axios request config: use `reqConfig.headers.set('key', value)` (method call, not assignment)
- `no-underscore-dangle`: rename the property to avoid leading/trailing underscores (e.g. `_retry` → `retried`)
- `react-hooks/exhaustive-deps`: stabilize with `useCallback`; for state values used in unmount-only effects, mirror the state into a `ref` with a sync effect so the `useCallback` deps stay stable

## Redux Slice Pattern
Every feature state lives in `src/state/<feature>/` with exactly four files:

| File | Purpose |
|------|---------|
| `*.slice.ts` | `createSlice` — initialState, reducers (clearSuccess, clearError, resetState), extraReducers |
| `*.actions.ts` | `createAsyncThunk` — one thunk per API call |
| `*.selectors.ts` | Memoized selectors (reselect) |
| `*.types.ts` | TypeScript interfaces for state shape and API payloads |

### Slice conventions
- `initialState` always has: `loading`, `error`, `success` fields
- Expose `clearSuccess`, `clearError`, `resetState` reducers on every slice
- `pending` → `loading = true, error = null`
- `fulfilled` → `loading = false`, update state data
- `rejected` → `loading = false, error = action.payload`

### Actions (thunks) conventions
- Use `axiosServer` from `@/services/axios.service`
- Always check `response.data.success`; call `rejectWithValue` if false
- Return `response.data` on success
- Catch block: `rejectWithValue(String(error))`
- Generic types: `createAsyncThunk<ReturnType, ArgType, { rejectValue: string }>`

## API Endpoints (relative to base URL)
- GET    `/machine-equipment`                  → list (params: page, limit, search, sortField, sortOrder)
- GET    `/machine-equipment/:id`              → by ID
- POST   `/machine-equipment/create`           → create
- PUT    `/machine-equipment/update/:id`       → update
- DELETE `/machine-equipment/delete/:id`       → delete

Same pattern for: `/person`, `/workplace`, `/workplace-category`, `/machine-equipment-type`, `/machine-availability-status`

## UI / UX Rules
- All component names must start with a capital letter
- Show loading indicators during all async operations (use `loading` from Redux state)
- Show error notifications for failed operations (use `error` from Redux state); clear after display
- Handle the `undefined, undefined` issue in unauthorized messages — check for empty values before rendering
- Sidebar must collapse on mobile view; adjust layout for small screens
- Login page and form must be centered/aligned properly

## Theme
- Light/dark mode toggle available to the user
- Theme preference stored in **localStorage** (not Redux — persists across sessions)
- MUI theme configured in `src/theme.tsx`

## Auth / Navigation
- Login uses employee number + password
- After login, redirect to dashboard/homepage
- Logout clears auth state and redirects to login
- User dropdown menu must include a **Change Password** link
- Change password page: user enters old password and new password (confirmed in two fields)

## Route Protection Rules
- Use `ProtectedRoute` wrapper (`src/reusableComponents/ProtectedRoute.tsx`) for every route that requires login
- Public routes (no `ProtectedRoute`): `/dashboard`, `/login`
- All other routes are protected — wrap with `<ProtectedRoute><Component /></ProtectedRoute>` in `App.tsx`
- When a logged-out user accesses a protected route, they see the `Unauthorized` page (`src/scenes/unauthorized/index.tsx`) with an "Access Denied" message and a "Go to Login" button — NOT a redirect
- **Never rely on API 401 errors to communicate access denied to the user** — guard at the route level

## Sidebar Visibility Rules
- Each nav item in `Sidebar.tsx` has a `requiresAuth` field (`boolean`)
- When `isLoggedIn = false`, items with `requiresAuth: true` are hidden from the sidebar
- Section headers (items where `icon = null`) are also hidden if all items in their section are auth-protected
- When adding a new nav item: set `requiresAuth: true` for all protected pages, `requiresAuth: false` only for public pages

## Machine Management UI
- Machine availability statuses are managed **from the Machine page**, not from the sidebar
- Machine statuses, types, and equipment are all under the Machine Management section

## Planned Scenes (future features)

### Machine (Mašina) — US03
- Machine list with status indicators (working/waiting/fault)
- Machine detail: counters (hours, pieces, scrap, energy), PDF card, image gallery, tool list, eligible workers
- Machine status panel: real-time status, logged-in worker, current operation mode
- Service history log

### Product / Part (Šifra komada) — US04
- Part list with part code, name, material, packaging unit
- Part detail: BOM tree view, PDF file, image, tool reference
- Part form: create/edit with BOM builder

### Tool (Alat) — US04
- Tool list with status (ok/fault/repair)
- Tool detail: compatible machines, produced parts, PDF, temperatures, lubrication/cleaning log
- Tool form: create/edit

### Work Order (Radni nalog) — US05
Each role sees only their relevant sub-orders. General rules:
- Real-time order status visible to Director, Planner, Shift Manager
- Work order is created by Planner; flows through sub-orders sequentially
- Each sub-order has a checklist-style UI (checkboxes for confirmations)

Role-specific views:
| Role | What they see |
|------|--------------|
| Planner | Full work order, all sub-orders, create/manage |
| Shift Manager | Production sub-order, worker/machine schedule |
| Transporter | Material delivery sub-order for their assigned machine |
| Tool Mounting Regler | Tool mounting sub-order: select old/new tool, confirm PDF read, confirm done |
| Machine Startup Regler | Startup sub-order: configure, confirm startup, log startup scrap |
| Production Worker | Their machine's production sub-order: log on, confirm PDF, log scrap |
| Quality Controller | QC sub-order: hourly confirmation form, deviation entry (color, dims, packaging, material) |
| Warehouse Worker | Warehouse receipt sub-order: receive goods, verify stock count |
| Printing Worker | Printing sub-order: start/end confirmation, piece/scrap count |
| Assembly Worker | Assembly sub-order: start/end confirmation, piece/scrap count |
| Recycling Worker | Recycling sub-order: grinder selection, start/end, output + material class |

### Plan (Radni plan) — US06
- Master plan view with sector sub-plan tabs (Production, Printing, Assembly, Warehouse, Maintenance, Recycling)
- Time level selector: Monthly / Weekly / Daily / Shift
- Production plan: machine assignment grid, worker schedule, regler schedule, tool change calendar
- Planner dashboard: stock levels, material needs, work hours calculation by part code

## Scrap Reasons (used in forms)
When logging scrap, always offer these reason options: Machine | Regler | Tool | Worker | Material | Aesthetics

## Forms
- Use **React Hook Form** with **Zod resolver** (`@hookform/resolvers/zod`)
- Zod schema lives in `src/zodValidationSchemas/<feature>.schema.ts`
- Keep schema types derived from Zod (`z.infer<typeof schema>`)

## Routing
- Routes defined in `src/App.tsx`
- Protected routes check auth state from Redux
- Route paths use kebab-case

## Styling
- MUI components are the default UI primitives
- Custom theme in `src/theme.tsx` (light/dark mode toggle via Redux `theme` slice)
- Tailwind used for layout utilities alongside MUI

## Reusable Components
- Before creating a new component, check `src/reusableComponents/` — ImageGallery, DateField, ProfileImageUpload, Sidebar, Navbar, Header already exist
- Page-level components go in `src/scenes/<domain>/`

## Adding a New Feature Checklist
1. Zod schema: `src/zodValidationSchemas/<feature>.schema.ts`
2. State slice files (4 files): `src/state/<feature>/`
3. Register reducer in `src/state/reducer.ts`
4. Scene components: `src/scenes/<domain>/<feature>/`
   - `index.tsx` — list/table view
   - `add<Feature>.tsx` — create form
   - `edit<Feature>.tsx` — edit form
5. Add routes in `src/App.tsx`
6. Add nav link in `src/reusableComponents/Sidebar.tsx`