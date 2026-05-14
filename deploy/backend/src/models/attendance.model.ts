import {
  Attendance,
  AttendanceBreak,
  AttendanceWithPerson,
  PersonKioskLookup,
} from "../service/attendance.service.types";
import { callQuery } from "./utils/query";

// Store timestamps as local-time strings in TIMESTAMP WITHOUT TZ columns.
// The Node process runs with TZ=Europe/Belgrade so getHours() etc. return local values.
// Using toISOString() would store UTC and cause a double-shift when pg reads it back.
const toLocalISOString = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const getPersonByRfidCardQuery = async (rfidCardNumber: string): Promise<PersonKioskLookup> => {
  const sql = `
    SELECT p.id, p.name, u.pin
    FROM "Person" p
    JOIN "User" u ON u."personId" = p.id
    WHERE p."rfidCardNumber" = $1
  `;
  return callQuery<PersonKioskLookup>(sql, [rfidCardNumber]);
};

export const getPersonByEmployeeNumberForKioskQuery = async (employeeNumber: string): Promise<PersonKioskLookup> => {
  const sql = `
    SELECT p.id, p.name, u.pin
    FROM "Person" p
    JOIN "User" u ON u."personId" = p.id
    WHERE u."employeeNumber" = CAST($1 AS INTEGER)
  `;
  return callQuery<PersonKioskLookup>(sql, [employeeNumber]);
};

export const getPersonForActionVerificationQuery = async (
  employeeNumber: string
): Promise<{ personId: string; userId: string; name: string; pin: string | null } | null> => {
  const sql = `
    SELECT p.id AS "personId", u.id AS "userId", p.name, u.pin
    FROM "Person" p
    JOIN "User" u ON u."personId" = p.id
    WHERE u."employeeNumber" = CAST($1 AS INTEGER)
  `;
  return callQuery<{ personId: string; userId: string; name: string; pin: string | null }>(sql, [employeeNumber]);
};

export const getOpenAttendanceByPersonQuery = async (personId: string): Promise<Attendance> => {
  const sql = `
    SELECT * FROM "Attendance"
    WHERE "personId" = $1 AND "checkOut" IS NULL
    ORDER BY "checkIn" DESC
    LIMIT 1
  `;
  return callQuery<Attendance>(sql, [personId]);
};

export const createAttendanceCheckInQuery = async (
  personId: string,
  checkIn: Date,
  shiftType: "first" | "second" | "night",
): Promise<Attendance> => {
  const sql = `
    INSERT INTO "Attendance" ("personId", date, "checkIn", "shiftType", "createdAt", "updatedAt")
    VALUES ($1, $2::date, $3, $4, NOW(), NOW())
    RETURNING *
  `;
  return callQuery<Attendance>(sql, [personId, toLocalISOString(checkIn), toLocalISOString(checkIn), shiftType]);
};

export const updateAttendanceCheckOutQuery = async (
  id: string,
  checkOut: Date,
  workMinutes: number,
  regularMinutes: number,
  overtimeMinutes: number,
  nightMinutes: number,
  weekendMinutes: number,
  note?: string | null,
  overtimeStatus?: "pending" | null,
  systemClosed?: boolean,
): Promise<Attendance> => {
  const sql = `
    UPDATE "Attendance"
    SET
      "checkOut"      = $2,
      "workMinutes"   = $3,
      "regularMinutes" = $4,
      "overtimeMinutes" = $5,
      "nightMinutes"  = $6,
      "weekendMinutes" = $7,
      "note"          = COALESCE($8, "note"),
      "overtimeStatus" = COALESCE($9, "overtimeStatus"),
      "systemClosed"  = COALESCE($10, "systemClosed"),
      "updatedAt"     = NOW()
    WHERE id = $1
    RETURNING *
  `;
  return callQuery<Attendance>(sql, [
    id,
    toLocalISOString(checkOut),
    workMinutes,
    regularMinutes,
    overtimeMinutes,
    nightMinutes,
    weekendMinutes,
    note ?? null,
    overtimeStatus ?? null,
    systemClosed ?? null,
  ]);
};

export const createManualAttendanceQuery = async (
  personId: string,
  date: string,
  checkIn: string,
  checkOut: string | null,
  shiftType: "first" | "second" | "night" | null,
  note: string | null,
  editedBy: string,
): Promise<Attendance> => {
  const sql = `
    INSERT INTO "Attendance"
      ("personId", date, "checkIn", "checkOut", "shiftType", note, "isManualEntry", "editedBy", "editedAt", "createdAt", "updatedAt")
    VALUES ($1, $2::date, $3, $4, $5, $6, TRUE, $7, NOW(), NOW(), NOW())
    RETURNING *
  `;
  return callQuery<Attendance>(sql, [personId, date, checkIn, checkOut, shiftType, note, editedBy]);
};

export const updateManualAttendanceQuery = async (
  id: string,
  fields: {
    date?: string;
    checkIn?: string;
    checkOut?: string;
    workMinutes?: number;
    regularMinutes?: number;
    overtimeMinutes?: number;
    nightMinutes?: number;
    weekendMinutes?: number;
    shiftType?: string;
    note?: string;
    overtimeStatus?: "pending" | "approved" | "rejected" | null;
  },
  editedBy: string,
): Promise<Attendance> => {
  const setClauses: string[] = [
    '"editedBy" = $2',
    '"editedAt" = NOW()',
    '"updatedAt" = NOW()',
  ];
  const params: (string | number | null)[] = [id, editedBy];
  let idx = 3;

  const fieldMap: Record<string, string> = {
    date: 'date',
    checkIn: '"checkIn"',
    checkOut: '"checkOut"',
    workMinutes: '"workMinutes"',
    regularMinutes: '"regularMinutes"',
    overtimeMinutes: '"overtimeMinutes"',
    nightMinutes: '"nightMinutes"',
    weekendMinutes: '"weekendMinutes"',
    shiftType: '"shiftType"',
    note: 'note',
    overtimeStatus: '"overtimeStatus"',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in fields && fields[key as keyof typeof fields] !== undefined) {
      setClauses.push(`${col} = $${idx}`);
      params.push(fields[key as keyof typeof fields] as string | number);
      idx += 1;
    }
  }

  const sql = `UPDATE "Attendance" SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`;
  return callQuery<Attendance>(sql, params);
};

export const getPendingOvertimeQuery = async (
  limit: number,
  offset: number,
): Promise<AttendanceWithPerson[]> => {
  const sql = `
    SELECT
      a.*,
      p.name AS "personName",
      u."employeeNumber"
    FROM "Attendance" a
    JOIN "Person" p ON p.id = a."personId"
    JOIN "User" u ON u."personId" = p.id
    WHERE a."overtimeStatus" = 'pending'
    ORDER BY a.date DESC, a."checkIn" DESC
    LIMIT $1 OFFSET $2
  `;
  return callQuery<AttendanceWithPerson[]>(sql, [limit, offset], true);
};

export const getPendingOvertimeCountQuery = async (): Promise<number> => {
  const sql = `SELECT COUNT(*)::int AS count FROM "Attendance" WHERE "overtimeStatus" = 'pending'`;
  const result = await callQuery<{ count: number }[]>(sql, [], true);
  return result?.[0]?.count ?? 0;
};

export const approveOvertimeQuery = async (
  id: string,
  status: "approved" | "rejected",
): Promise<AttendanceWithPerson> => {
  const sql = `
    WITH updated AS (
      UPDATE "Attendance"
      SET "overtimeStatus" = $2, "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    )
    SELECT
      u.*,
      p.name AS "personName",
      usr."employeeNumber"
    FROM updated u
    JOIN "Person" p ON p.id = u."personId"
    JOIN "User" usr ON usr."personId" = p.id
  `;
  return callQuery<AttendanceWithPerson>(sql, [id, status]);
};

export const getAllAttendancesQuery = async (
  limit: number,
  offset: number,
  personId: string,
  dateFrom: string,
  dateTo: string,
  sortField: string,
  sortOrder: string,
): Promise<AttendanceWithPerson[]> => {
  const validSortFields = ["date", "checkIn", "checkOut", "workMinutes", "createdAt"];
  const orderBy = validSortFields.includes(sortField) ? `a."${sortField}"` : `a."date"`;
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const conditions: string[] = [];
  const params: (string | number)[] = [limit, offset];
  let paramIdx = 3;

  if (personId) {
    conditions.push(`a."personId" = $${paramIdx}`);
    params.push(personId);
    paramIdx += 1;
  }
  if (dateFrom) {
    conditions.push(`a.date >= $${paramIdx}::date`);
    params.push(dateFrom);
    paramIdx += 1;
  }
  if (dateTo) {
    conditions.push(`a.date <= $${paramIdx}::date`);
    params.push(dateTo);
    paramIdx += 1;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT
      a.*,
      p.name AS "personName",
      u."employeeNumber",
      COALESCE(br."breakCount", 0)::int AS "breakCount",
      COALESCE(br."totalBreakMinutes", 0)::int AS "totalBreakMinutes"
    FROM "Attendance" a
    JOIN "Person" p ON p.id = a."personId"
    JOIN "User" u ON u."personId" = p.id
    LEFT JOIN (
      SELECT "attendanceId",
             COUNT(*)::int AS "breakCount",
             COALESCE(SUM("breakMinutes"), 0)::int AS "totalBreakMinutes"
      FROM "AttendanceBreak"
      GROUP BY "attendanceId"
    ) br ON br."attendanceId" = a.id
    ${where}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $1
    OFFSET $2
  `;

  return callQuery<AttendanceWithPerson[]>(sql, params, true);
};

export const getBreaksByAttendanceIdQuery = async (attendanceId: string): Promise<AttendanceBreak[]> => {
  const sql = `
    SELECT id, "attendanceId", "breakStart", "breakEnd", "breakMinutes", "createdAt", "updatedAt"
    FROM "AttendanceBreak"
    WHERE "attendanceId" = $1
    ORDER BY "breakStart" ASC
  `;
  return callQuery<AttendanceBreak[]>(sql, [attendanceId], true);
};

export const getTotalAttendancesCountQuery = async (
  personId: string,
  dateFrom: string,
  dateTo: string,
): Promise<number> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  if (personId) {
    conditions.push(`"personId" = $${paramIdx}`);
    params.push(personId);
    paramIdx += 1;
  }
  if (dateFrom) {
    conditions.push(`date >= $${paramIdx}::date`);
    params.push(dateFrom);
    paramIdx += 1;
  }
  if (dateTo) {
    conditions.push(`date <= $${paramIdx}::date`);
    params.push(dateTo);
    paramIdx += 1;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT COUNT(*)::int AS count FROM "Attendance" ${where}`;

  const result = await callQuery<{ count: number }[]>(sql, params, true);
  return result?.[0]?.count ?? 0;
};

export const getAttendanceByIdQuery = async (id: string): Promise<AttendanceWithPerson> => {
  const sql = `
    SELECT
      a.*,
      p.name AS "personName",
      u."employeeNumber"
    FROM "Attendance" a
    JOIN "Person" p ON p.id = a."personId"
    JOIN "User" u ON u."personId" = p.id
    WHERE a.id = $1
  `;
  return callQuery<AttendanceWithPerson>(sql, [id]);
};

export const getMonthlySummaryQuery = async (
  personId: string,
  year: number,
  month: number,
): Promise<{
  totalWorkingDays: string;
  totalWorkMinutes: string;
  totalOvertimeMinutes: string;
  totalNightMinutes: string;
  totalWeekendMinutes: string;
}> => {
  const sql = `
    SELECT
      COUNT(DISTINCT date)::int AS "totalWorkingDays",
      COALESCE(SUM("workMinutes"), 0)::int AS "totalWorkMinutes",
      COALESCE(SUM("overtimeMinutes"), 0)::int AS "totalOvertimeMinutes",
      COALESCE(SUM("nightMinutes"), 0)::int AS "totalNightMinutes",
      COALESCE(SUM("weekendMinutes"), 0)::int AS "totalWeekendMinutes"
    FROM "Attendance"
    WHERE "personId" = $1
      AND EXTRACT(YEAR FROM date) = $2
      AND EXTRACT(MONTH FROM date) = $3
      AND "checkOut" IS NOT NULL
  `;
  return callQuery<{
    totalWorkingDays: string;
    totalWorkMinutes: string;
    totalOvertimeMinutes: string;
    totalNightMinutes: string;
    totalWeekendMinutes: string;
  }>(sql, [personId, year, month]);
};

export const getOpenBreakByAttendanceQuery = async (attendanceId: string): Promise<AttendanceBreak> => {
  const sql = `
    SELECT * FROM "AttendanceBreak"
    WHERE "attendanceId" = $1 AND "breakEnd" IS NULL
    ORDER BY "breakStart" DESC
    LIMIT 1
  `;
  return callQuery<AttendanceBreak>(sql, [attendanceId]);
};

export const createBreakStartQuery = async (attendanceId: string, breakStart: Date): Promise<AttendanceBreak> => {
  const sql = `
    INSERT INTO "AttendanceBreak" ("attendanceId", "breakStart", "createdAt", "updatedAt")
    VALUES ($1, $2, NOW(), NOW())
    RETURNING *
  `;
  return callQuery<AttendanceBreak>(sql, [attendanceId, toLocalISOString(breakStart)]);
};

export const closeOpenBreakQuery = async (attendanceId: string, breakEnd: Date): Promise<AttendanceBreak> => {
  const sql = `
    UPDATE "AttendanceBreak"
    SET
      "breakEnd" = $2,
      "breakMinutes" = ROUND(EXTRACT(EPOCH FROM ($2::TIMESTAMP - "breakStart")) / 60),
      "updatedAt" = NOW()
    WHERE "attendanceId" = $1 AND "breakEnd" IS NULL
    RETURNING *
  `;
  return callQuery<AttendanceBreak>(sql, [attendanceId, toLocalISOString(breakEnd)]);
};

export const getTotalBreakMinutesQuery = async (attendanceId: string): Promise<number> => {
  const sql = `
    SELECT COALESCE(SUM("breakMinutes"), 0)::int AS total
    FROM "AttendanceBreak"
    WHERE "attendanceId" = $1 AND "breakMinutes" IS NOT NULL
  `;
  const result = await callQuery<{ total: number }>(sql, [attendanceId]);
  return result?.total ?? 0;
};