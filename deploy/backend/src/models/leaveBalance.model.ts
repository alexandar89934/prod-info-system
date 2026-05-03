import { LeaveBalance } from "../service/leaveRecord.service.types";
import { callQuery } from "./utils/query";

export const getLeaveBalanceForYearQuery = async (
  personId: string,
  year: number,
): Promise<LeaveBalance> => {
  const sql = `SELECT * FROM "LeaveBalance" WHERE "personId" = $1 AND year = $2`;
  return callQuery<LeaveBalance>(sql, [personId, year], true);
};

export const upsertLeaveBalanceQuery = async (
  personId: string,
  year: number,
  totalVacationDays: number,
): Promise<LeaveBalance> => {
  const sql = `
    INSERT INTO "LeaveBalance" ("personId", year, "totalVacationDays", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, NOW(), NOW())
    ON CONFLICT ("personId", year)
    DO UPDATE SET "totalVacationDays" = $3, "updatedAt" = NOW()
    RETURNING *
  `;
  return callQuery<LeaveBalance>(sql, [personId, year, totalVacationDays], true);
};

export const getLeaveUsedDaysQuery = async (
  personId: string,
  year: number,
): Promise<{ usedDays: string }> => {
  const sql = `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN "isHalfDay" = TRUE THEN 0.5
            ELSE (EXTRACT(DAY FROM ("endDate"::date - "startDate"::date)) + 1)
          END
        ),
        0
      ) AS "usedDays"
    FROM "LeaveRecord"
    WHERE "personId" = $1
      AND type = 'vacation'
      AND status = 'approved'
      AND EXTRACT(YEAR FROM "startDate"::date) = $2
  `;
  return callQuery<{ usedDays: string }>(sql, [personId, year], true);
};