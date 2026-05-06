import { CreatePackagingUnitData, EditPackagingUnitData, PackagingUnit } from "../service/packagingUnit.service.types";
import { callQuery } from "./utils/query";

export const getAllPackagingUnitsQuery = async (
  search: string, limit: number, offset: number
): Promise<{ rows: PackagingUnit[]; total: number }> => {
  const param = `%${search}%`;
  const [rows, counts] = await Promise.all([
    callQuery<PackagingUnit[]>(
      `SELECT * FROM "PackagingUnits" WHERE "name" ILIKE $1 OR COALESCE("description", '') ILIKE $1 ORDER BY "name" ASC LIMIT $2 OFFSET $3`,
      [param, limit, offset], true
    ),
    callQuery<{ count: string }[]>(
      `SELECT COUNT(*) FROM "PackagingUnits" WHERE "name" ILIKE $1 OR COALESCE("description", '') ILIKE $1`,
      [param], true
    ),
  ]);
  return { rows: rows ?? [], total: parseInt(counts?.[0]?.count ?? "0", 10) };
};

export const getPackagingUnitByIdQuery = async (id: string): Promise<PackagingUnit> =>
  callQuery<PackagingUnit>(`SELECT * FROM "PackagingUnits" WHERE "id" = $1`, [id]);

export const createPackagingUnitQuery = async (data: CreatePackagingUnitData): Promise<PackagingUnit> =>
  callQuery<PackagingUnit>(
    `INSERT INTO "PackagingUnits" ("id", "name", "description", "picture", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING *`,
    [data.name, data.description ?? null, data.picture ? JSON.stringify(data.picture) : null]
  );

export const updatePackagingUnitQuery = async (data: EditPackagingUnitData): Promise<PackagingUnit> =>
  callQuery<PackagingUnit>(
    `UPDATE "PackagingUnits" SET "name" = $1, "description" = $2, "picture" = $3, "updatedAt" = NOW()
     WHERE "id" = $4 RETURNING *`,
    [data.name, data.description ?? null, data.picture ? JSON.stringify(data.picture) : null, data.id]
  );

export const deletePackagingUnitQuery = async (id: string): Promise<PackagingUnit> =>
  callQuery<PackagingUnit>(`DELETE FROM "PackagingUnits" WHERE "id" = $1 RETURNING *`, [id]);