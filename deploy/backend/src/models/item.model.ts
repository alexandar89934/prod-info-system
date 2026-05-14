import { CreateItemData, EditItemData, Item } from "../service/item.service.types";
import { callQuery } from "./utils/query";

export const getAllItemsQuery = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<Item[]> => {
  const validSortFields = ["id", "itemCode", "name", "category", "unit", "priceEurPerUnit", "createdAt", "updatedAt"];
  const orderBy = validSortFields.includes(sortField) ? `i."${sortField}"` : 'i."createdAt"';
  const orderDirection = sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const sql = `
    SELECT i.*, m."name" AS "toolName", m."inventoryNumber" AS "toolInventoryNumber"
    FROM "Items" i
    LEFT JOIN "Molds" m ON m."id" = i."toolId"
    WHERE i."name" ILIKE $3 OR i."itemCode" ILIKE $3
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $1 OFFSET $2
  `;
  return callQuery<Item[]>(sql, [Number(limit), Number(offset), `%${search}%`], true) || [];
};

export const getTotalItemsCountQuery = async (search: string): Promise<number> => {
  const where = search ? `WHERE "name" ILIKE $1 OR "itemCode" ILIKE $1` : "";
  const sql = `SELECT COUNT(*)::int AS count FROM "Items" ${where}`;
  const result = await callQuery<{ count: string }[]>(sql, search ? [`%${search}%`] : [], true);
  return parseInt(result?.[0]?.count ?? "0", 10);
};

export const getItemByIdQuery = async (id: string): Promise<Item> => {
  const sql = `
    SELECT i.*, m."name" AS "toolName", m."inventoryNumber" AS "toolInventoryNumber"
    FROM "Items" i
    LEFT JOIN "Molds" m ON m."id" = i."toolId"
    WHERE i."id" = $1
  `;
  return callQuery<Item>(sql, [id]);
};

export const getItemsByMoldQuery = async (moldId: string): Promise<Item[]> => {
  const sql = `
    SELECT i.*, m."name" AS "toolName", m."inventoryNumber" AS "toolInventoryNumber"
    FROM "Items" i
    LEFT JOIN "Molds" m ON m."id" = i."toolId"
    WHERE i."toolId" = $1
    ORDER BY i."itemCode" ASC
  `;
  return callQuery<Item[]>(sql, [moldId], true) || [];
};

export const checkItemCodeExistsQuery = async (itemCode: string, excludeId?: string): Promise<{ count: number }> => {
  const sql = excludeId
    ? `SELECT COUNT(*)::int AS count FROM "Items" WHERE "itemCode" = $1 AND "id" != $2`
    : `SELECT COUNT(*)::int AS count FROM "Items" WHERE "itemCode" = $1`;
  const result = await callQuery<{ count: number }[]>(sql, excludeId ? [itemCode, excludeId] : [itemCode], true);
  return result?.[0] ?? { count: 0 };
};

export const createItemQuery = async (data: CreateItemData): Promise<Item> => {
  const sql = `
    INSERT INTO "Items"
      ("id", "itemCode", "name", "category", "unit",
       "priceEurPerUnit", "approvalLevel", "toolId", "pictures", "documents", "notes",
       "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(), $1, $2, $3::"enum_Items_category", $4::"enum_Items_unit",
      $5, $6::"enum_Items_approvalLevel", $7, $8, $9, $10,
      NOW(), NOW()
    )
    RETURNING *
  `;
  return callQuery<Item>(sql, [
    data.itemCode,
    data.name,
    data.category,
    data.unit,
    data.priceEurPerUnit ?? null,
    data.approvalLevel ?? null,
    data.toolId ?? null,
    JSON.stringify(data.pictures ?? []),
    JSON.stringify(data.documents ?? []),
    data.notes ?? null,
  ]);
};

export const updateItemQuery = async (data: EditItemData): Promise<Item> => {
  const sql = `
    UPDATE "Items" SET
      "itemCode" = $1,
      "name" = $2,
      "category" = $3::"enum_Items_category",
      "unit" = $4::"enum_Items_unit",
      "priceEurPerUnit" = $5,
      "approvalLevel" = $6::"enum_Items_approvalLevel",
      "toolId" = $7,
      "pictures" = $8,
      "documents" = $9,
      "notes" = $10,
      "updatedAt" = NOW()
    WHERE "id" = $11
    RETURNING *
  `;
  return callQuery<Item>(sql, [
    data.itemCode,
    data.name,
    data.category,
    data.unit,
    data.priceEurPerUnit ?? null,
    data.approvalLevel ?? null,
    data.toolId ?? null,
    JSON.stringify(data.pictures ?? []),
    JSON.stringify(data.documents ?? []),
    data.notes ?? null,
    data.id,
  ]);
};

export const deleteItemQuery = async (id: string): Promise<Item> => {
  const sql = `DELETE FROM "Items" WHERE "id" = $1 RETURNING *`;
  return callQuery<Item>(sql, [id]);
};