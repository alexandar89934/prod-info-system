import {
  CreateResponsibilityData,
  EditResponsibilityData,
  Responsibility,
} from "../service/responsibility.service.types";
import { callQuery } from "./utils/query";

export const getAllResponsibilitiesQuery = async (): Promise<
  Responsibility[]
> => {
  const sql = `
    SELECT id, code, label, description, "isSystem", "createdAt", "updatedAt"
    FROM "Responsibility"
    ORDER BY "isSystem" DESC, label ASC
  `;
  return callQuery<Responsibility[]>(sql, [], true);
};

export const getResponsibilityByIdQuery = async (
  id: number,
): Promise<Responsibility | null> => {
  const sql = `
    SELECT id, code, label, description, "isSystem", "createdAt", "updatedAt"
    FROM "Responsibility"
    WHERE id = $1
  `;
  const rows = await callQuery<Responsibility[]>(sql, [id], true);
  return rows?.[0] ?? null;
};

export const getResponsibilityByCodeQuery = async (
  code: string,
  excludeId?: number,
): Promise<{ count: number }> => {
  let sql = `SELECT COUNT(*)::int AS count FROM "Responsibility" WHERE code = $1`;
  const params: (string | number)[] = [code];
  if (excludeId) {
    sql += ` AND id != $2`;
    params.push(excludeId);
  }
  return callQuery<{ count: number }>(sql, params);
};

export const createResponsibilityQuery = async (
  data: CreateResponsibilityData,
): Promise<Responsibility> => {
  const sql = `
    INSERT INTO "Responsibility" (code, label, description, "isSystem", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, FALSE, NOW(), NOW())
    RETURNING *
  `;
  return callQuery<Responsibility>(sql, [
    data.code,
    data.label,
    data.description ?? null,
  ]);
};

export const updateResponsibilityQuery = async (
  data: EditResponsibilityData,
): Promise<Responsibility> => {
  const sql = `
    UPDATE "Responsibility"
    SET label = $1, description = $2, "updatedAt" = NOW()
    WHERE id = $3 AND "isSystem" = FALSE
    RETURNING *
  `;
  return callQuery<Responsibility>(sql, [
    data.label,
    data.description ?? null,
    data.id,
  ]);
};

export const deleteResponsibilityQuery = async (id: number): Promise<boolean> => {
  const sql = `
    DELETE FROM "Responsibility"
    WHERE id = $1 AND "isSystem" = FALSE
    RETURNING id
  `;
  return callQuery<boolean>(sql, [id]);
};