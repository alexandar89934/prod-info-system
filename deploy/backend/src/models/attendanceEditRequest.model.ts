import {
  AttendanceEditRequest,
  CreateAttendanceEditRequestData,
  ProcessAttendanceEditRequestData,
} from "../service/attendanceEditRequest.service.types";
import { callQuery } from "./utils/query";

export const createAttendanceEditRequestQuery = async (
  data: CreateAttendanceEditRequestData,
): Promise<AttendanceEditRequest> => {
  const sql = `
    INSERT INTO "AttendanceEditRequest"
      ("attendanceId", "requestedBy", "originalValues", "newValues", reason, status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
    RETURNING *
  `;
  return callQuery<AttendanceEditRequest>(sql, [
    data.attendanceId,
    data.requestedBy,
    JSON.stringify(data.originalValues),
    JSON.stringify(data.newValues),
    data.reason,
  ], true);
};

export const processAttendanceEditRequestQuery = async (
  data: ProcessAttendanceEditRequestData,
): Promise<AttendanceEditRequest> => {
  const sql = `
    UPDATE "AttendanceEditRequest"
    SET
      status = $2,
      "approvedBy" = $3,
      "approvedAt" = NOW(),
      "rejectReason" = $4,
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `;
  return callQuery<AttendanceEditRequest>(sql, [
    data.id,
    data.status,
    data.approvedBy,
    data.rejectReason ?? null,
  ], true);
};

export const applyAttendanceEditQuery = async (
  attendanceId: string,
  newValues: Record<string, unknown>,
): Promise<void> => {
  const allowed = ["checkIn", "checkOut", "workMinutes", "regularMinutes", "overtimeMinutes", "nightMinutes", "weekendMinutes", "note", "shiftType"];
  const setClauses: string[] = [];
  const params: (string | number | null)[] = [attendanceId];
  let paramIdx = 2;

  for (const key of allowed) {
    if (key in newValues) {
      setClauses.push(`"${key}" = $${paramIdx}`);
      params.push(newValues[key] as string | number | null);
      paramIdx += 1;
    }
  }

  if (setClauses.length === 0) return;

  const sql = `UPDATE "Attendance" SET ${setClauses.join(", ")}, "updatedAt" = NOW() WHERE id = $1`;
  await callQuery<void>(sql, params, true);
};

export const getAttendanceEditRequestByIdQuery = async (id: string): Promise<AttendanceEditRequest> => {
  const sql = `
    SELECT aer.*,
      rb.name AS "requestedByName",
      ab.name AS "approvedByName"
    FROM "AttendanceEditRequest" aer
    JOIN "Person" rb ON rb.id = aer."requestedBy"
    LEFT JOIN "Person" ab ON ab.id = aer."approvedBy"
    WHERE aer.id = $1
  `;
  return callQuery<AttendanceEditRequest>(sql, [id], true);
};

export const getAllAttendanceEditRequestsQuery = async (
  limit: number,
  offset: number,
  status: string,
): Promise<AttendanceEditRequest[]> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [limit, offset];
  let paramIdx = 3;

  if (status) {
    conditions.push(`aer.status = $${paramIdx}`);
    params.push(status);
    paramIdx += 1;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT aer.*,
      rb.name AS "requestedByName",
      ab.name AS "approvedByName"
    FROM "AttendanceEditRequest" aer
    JOIN "Person" rb ON rb.id = aer."requestedBy"
    LEFT JOIN "Person" ab ON ab.id = aer."approvedBy"
    ${where}
    ORDER BY aer."createdAt" DESC
    LIMIT $1
    OFFSET $2
  `;
  return callQuery<AttendanceEditRequest[]>(sql, params, true);
};

export const getTotalAttendanceEditRequestsCountQuery = async (status: string): Promise<number> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (status) {
    conditions.push(`status = $1`);
    params.push(status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT COUNT(*)::int AS count FROM "AttendanceEditRequest" ${where}`;
  const result = await callQuery<{ count: number }[]>(sql, params, true);
  return result?.[0]?.count ?? 0;
};