import {
  ApproveLeaveRecordData,
  CreateLeaveRecordData,
  LeaveRecord,
} from "../service/leaveRecord.service.types";
import { callQuery } from "./utils/query";

export const createLeaveRecordQuery = async (data: CreateLeaveRecordData): Promise<LeaveRecord> => {
  const isSick = data.type === "sick";
  const sql = `
    INSERT INTO "LeaveRecord" (
      "personId", type, "startDate", "endDate", "isHalfDay", "halfDayPart",
      status, "requestNote", documents, "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3::date, $4::date, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *
  `;
  return callQuery<LeaveRecord>(sql, [
    data.personId,
    data.type,
    data.startDate,
    data.endDate,
    data.isHalfDay ?? false,
    data.halfDayPart ?? null,
    isSick ? "approved" : "pending",
    data.requestNote ?? null,
    JSON.stringify(data.documents ?? []),
  ], true);
};

export const approveLeaveRecordQuery = async (data: ApproveLeaveRecordData): Promise<LeaveRecord> => {
  const sql = `
    UPDATE "LeaveRecord"
    SET
      status = $2,
      "approvedBy" = $3,
      "approvedAt" = NOW(),
      "rejectReason" = $4,
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `;
  return callQuery<LeaveRecord>(sql, [
    data.id,
    data.status,
    data.approvedBy,
    data.rejectReason ?? null,
  ], true);
};

export const getLeaveRecordByIdQuery = async (id: string): Promise<LeaveRecord> => {
  const sql = `
    SELECT lr.*, p.name AS "personName", ab.name AS "approvedByName"
    FROM "LeaveRecord" lr
    JOIN "Person" p ON p.id = lr."personId"
    LEFT JOIN "Person" ab ON ab.id = lr."approvedBy"
    WHERE lr.id = $1
  `;
  return callQuery<LeaveRecord>(sql, [id], true);
};

export const getAllLeaveRecordsQuery = async (
  limit: number,
  offset: number,
  personId: string,
  type: string,
  status: string,
  year: number,
  sortField: string,
  sortOrder: string,
): Promise<LeaveRecord[]> => {
  const validSortFields = ["startDate", "endDate", "type", "status", "createdAt"];
  const orderBy = validSortFields.includes(sortField) ? `lr."${sortField}"` : `lr."startDate"`;
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const conditions: string[] = [];
  const params: (string | number)[] = [limit, offset];
  let paramIdx = 3;

  if (personId) {
    conditions.push(`lr."personId" = $${paramIdx}`);
    params.push(personId);
    paramIdx += 1;
  }
  if (type) {
    conditions.push(`lr.type = $${paramIdx}`);
    params.push(type);
    paramIdx += 1;
  }
  if (status) {
    conditions.push(`lr.status = $${paramIdx}`);
    params.push(status);
    paramIdx += 1;
  }
  if (year) {
    conditions.push(`EXTRACT(YEAR FROM lr."startDate"::date) = $${paramIdx}`);
    params.push(year);
    paramIdx += 1;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT lr.*, p.name AS "personName"
    FROM "LeaveRecord" lr
    JOIN "Person" p ON p.id = lr."personId"
    ${where}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $1
    OFFSET $2
  `;
  return callQuery<LeaveRecord[]>(sql, params, true);
};

export const getTotalLeaveRecordsCountQuery = async (
  personId: string,
  type: string,
  status: string,
  year: number,
): Promise<number> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  if (personId) {
    conditions.push(`"personId" = $${paramIdx}`);
    params.push(personId);
    paramIdx += 1;
  }
  if (type) {
    conditions.push(`type = $${paramIdx}`);
    params.push(type);
    paramIdx += 1;
  }
  if (status) {
    conditions.push(`status = $${paramIdx}`);
    params.push(status);
    paramIdx += 1;
  }
  if (year) {
    conditions.push(`EXTRACT(YEAR FROM "startDate"::date) = $${paramIdx}`);
    params.push(year);
    paramIdx += 1;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT COUNT(*)::int AS count FROM "LeaveRecord" ${where}`;
  const result = await callQuery<{ count: number }[]>(sql, params, true);
  return result?.[0]?.count ?? 0;
};

export const updateLeaveDocumentsQuery = async (id: string, documents: string[]): Promise<LeaveRecord> => {
  const sql = `
    UPDATE "LeaveRecord" SET documents = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *
  `;
  return callQuery<LeaveRecord>(sql, [JSON.stringify(documents), id], true);
};