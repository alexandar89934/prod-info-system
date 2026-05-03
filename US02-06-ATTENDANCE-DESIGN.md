# US02-06 — Attendance Tracking Design

## Overview

Workers check in when they arrive and check out at the end of their shift.
The system tracks working time, classifies hours (regular / overtime / night / weekend),
manages vacation and sick leave with an approval workflow, and enforces visibility
and edit permissions through the existing Responsibility system.

---

## Kiosk

Two dedicated full-screen routes in the existing frontend app — no separate codebase.

| Route | Description |
|---|---|
| `/kiosk` | Single smart terminal page — auto-detects check-in vs check-out |

**How auto-detect works:** on authentication, the system checks the person's last
`Attendance` record. If there is no open session (no `checkOut`) → check-in.
If there is an open session → check-out.

**Authentication methods (in order of preference):**
1. RFID card scan — USB/HID reader acts as a keyboard, types the card ID and presses Enter into an always-focused input field
2. Employee number + 4-digit PIN (fallback, for forgotten/lost cards)

**PIN field:** add `pin` (4-digit, bcrypt-hashed) to the `User` table.
Set from the person's own profile page.

**UI:** no sidebar, no navbar, full screen. Shows confirmation (name, time, action performed) for 3 seconds then resets.

---

## Data Model

### Attendance

Stores one record per work session (check-in → check-out pair).

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `personId` | UUID FK Person | |
| `date` | DATE | The working day date |
| `checkIn` | TIMESTAMP | Set on check-in |
| `checkOut` | TIMESTAMP nullable | Set on check-out |
| `workMinutes` | INTEGER nullable | Computed on check-out: checkOut − checkIn |
| `regularMinutes` | INTEGER nullable | workMinutes − overtime − night |
| `overtimeMinutes` | INTEGER nullable | Minutes beyond 480 (8h standard) |
| `nightMinutes` | INTEGER nullable | Minutes within 22:00–06:00 window |
| `weekendMinutes` | INTEGER nullable | Minutes on Saturday or Sunday |
| `shiftType` | VARCHAR | Auto-detected: `first` / `second` / `night` |
| `note` | TEXT nullable | |
| `createdAt` | TIMESTAMP | |
| `updatedAt` | TIMESTAMP | |

**Computation rules (all applied at check-out):**
- `nightMinutes` — overlap of [checkIn, checkOut] with 22:00–06:00 window
- `weekendMinutes` — full workMinutes if date is Saturday/Sunday
- `overtimeMinutes` — max(0, workMinutes − 480)
- `regularMinutes` — workMinutes − overtimeMinutes − nightMinutes

> Rate multipliers (1.5× overtime, 2× weekend, 1.5× night) stored in a `SystemConfig`
> table — seeded with defaults, editable by admin without code changes.

---

### AttendanceEditRequest

Managers cannot edit attendance records directly. Every edit creates a request
that a Director must approve before the record is updated.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `attendanceId` | UUID FK Attendance | |
| `requestedBy` | UUID FK Person | The manager who submitted the edit |
| `originalValues` | JSONB | Snapshot of fields before change |
| `newValues` | JSONB | Proposed field values |
| `reason` | TEXT | Required — why the edit is needed |
| `status` | VARCHAR | `pending` / `approved` / `rejected` |
| `approvedBy` | UUID FK Person nullable | |
| `approvedAt` | TIMESTAMP nullable | |
| `rejectReason` | TEXT nullable | |
| `createdAt` | TIMESTAMP | |
| `updatedAt` | TIMESTAMP | |

---

### LeaveRecord

Covers vacation, sick days, and other absences. Supports full days and half-days.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `personId` | UUID FK Person | |
| `type` | VARCHAR | `vacation` / `sick` / `other` |
| `startDate` | DATE | |
| `endDate` | DATE | |
| `isHalfDay` | BOOLEAN | Default false |
| `halfDayPart` | VARCHAR nullable | `morning` / `afternoon` — only when `isHalfDay = true` |
| `status` | VARCHAR | `pending` / `approved` / `rejected` |
| `approvedBy` | UUID FK Person nullable | |
| `approvedAt` | TIMESTAMP nullable | |
| `requestNote` | TEXT nullable | Submitted by the employee |
| `rejectReason` | TEXT nullable | Filled by approver on rejection |
| `documents` | JSONB | Sick certificates, etc. (same pattern as Person.documents) |
| `createdAt` | TIMESTAMP | |
| `updatedAt` | TIMESTAMP | |

**Sick days:** can be submitted without pre-approval (or auto-approved).
Document upload is required (sick certificate). Admin can also enter on behalf of a person.

**Half-day:** counts as 0.5 days against the leave balance.

---

### LeaveBalance

One row per person per year. Tracks vacation allowance.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `personId` | UUID FK Person | |
| `year` | INTEGER | |
| `totalVacationDays` | DECIMAL | Default 20, editable per person per year |
| `createdAt` | TIMESTAMP | |
| `updatedAt` | TIMESTAMP | |
| UNIQUE | `(personId, year)` | |

Used days are computed on the fly from approved `LeaveRecord` rows for that person and year.
`remainingDays = totalVacationDays − usedDays`

---

## Person Table Extension

| New field | Type | Notes |
|---|---|---|
| `supervisorId` | UUID FK Person nullable | Direct supervisor — defines "team" membership |
| `pin` | VARCHAR nullable | 4-digit bcrypt-hashed PIN for kiosk fallback (stored on User table) |

---

## Permissions (Responsibilities)

Four new responsibilities to be added to the `Responsibility` table and assigned
to the appropriate job positions via `JobPositionResponsibilities`.

| Responsibility | Suggested job positions | What it enables |
|---|---|---|
| `view_team_attendance` | Manager, Team lead, Chef | See attendance of all persons where `supervisorId = self` |
| `view_all_attendance` | Director, Bookkeeping | See everyone's attendance |
| `edit_attendance` | Manager, Team lead, Chef | Submit `AttendanceEditRequest` — NOT a direct edit |
| `approve_attendance_edit` | Director | Approve or reject pending edit requests |
| `vacation_approval` | Director, Manager, anyone C-level | Approve or reject `LeaveRecord` requests |

**Visibility matrix:**

| Who | Own records | Team records | All records | Can edit | Approves edits | Approves vacation |
|---|---|---|---|---|---|---|
| Regular worker | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manager / Lead / Chef | ✅ | ✅ | ❌ | ✅ (via request) | ❌ | ✅ (if assigned) |
| Director | ✅ | ✅ | ✅ | ✅ (via request) | ✅ | ✅ |
| Bookkeeping | ✅ | — | ✅ (read-only) | ❌ | ❌ | ❌ |

---

## Main Attendance Management Page

- **Default view:** current month
- **Filters:** person (single or team), date range, leave type, status
- **Per-day row shows:** check-in time, check-out time, total hours, breakdown (regular / overtime / night / weekend), leave status if applicable
- **Monthly summary:** total working days, total hours, overtime hours, vacation days used / remaining
- **Pending approvals section:** visible only to users with `vacation_approval` or `approve_attendance_edit` responsibility — shows pending items as a queue

---

## Backend Middleware

New middleware added to `verifyTokenMiddleware.ts` alongside existing ones:

| Middleware | Checks |
|---|---|
| `authorizeVacationApprover` | User's job position has `vacation_approval` responsibility |
| `authorizeAttendanceEditor` | User's job position has `edit_attendance` responsibility |
| `authorizeAttendanceEditApprover` | User's job position has `approve_attendance_edit` responsibility |
| `authorizeTeamAttendanceViewer` | User has `view_team_attendance` or `view_all_attendance` |

---

## Migrations Required

1. `create-attendance` — `Attendance` table
2. `create-attendance-edit-request` — `AttendanceEditRequest` table
3. `create-leave-record` — `LeaveRecord` table
4. `create-leave-balance` — `LeaveBalance` table
5. `add-supervisor-to-person` — `supervisorId` column on `Person`
6. `add-pin-to-user` — `pin` column on `User`
7. `create-system-config` — `SystemConfig` table for rate multipliers + work hour defaults
8. `seed-attendance-responsibilities` — inserts the 5 new responsibilities

---

## Open Items / Future Refinement

- Rate multipliers (overtime ×1.5, weekend ×2, night ×1.5) — seeded as defaults, editable by admin
- Standard work hours (480 min / 8h) — stored in `SystemConfig`, editable
- Public holidays — not in scope yet; can be added as a `Holiday` table later
- Shift scheduling (pre-assigning first/second/night shift per person per week) — out of scope for now, shift is auto-detected from check-in time
- Yearly leave balance rollover rules — out of scope for now
- Offline kiosk support (tablet loses connectivity) — out of scope for now