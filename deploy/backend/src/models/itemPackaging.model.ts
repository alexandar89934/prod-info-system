import { CreateItemPackagingData, EditItemPackagingData, ItemPackaging } from "../service/itemPackaging.service.types";
import { callQuery } from "./utils/query";

const joinedSelect = `
  SELECT ip.*, pu."name" AS "packagingUnitName", pu."description" AS "packagingUnitDescription", pu."picture" AS "packagingUnitPicture"
  FROM "ItemPackaging" ip
  JOIN "PackagingUnits" pu ON pu."id" = ip."packagingUnitId"
`;

export const getItemPackagingsByItemQuery = async (itemId: string): Promise<ItemPackaging[]> =>
  callQuery<ItemPackaging[]>(`${joinedSelect} WHERE ip."itemId" = $1 ORDER BY pu."name" ASC`, [itemId], true) ?? [];

export const getItemPackagingByIdQuery = async (id: string): Promise<ItemPackaging> =>
  callQuery<ItemPackaging>(`${joinedSelect} WHERE ip."id" = $1`, [id]);

export const createItemPackagingQuery = async (data: CreateItemPackagingData): Promise<ItemPackaging> =>
  callQuery<ItemPackaging>(
    `INSERT INTO "ItemPackaging" ("id", "itemId", "packagingUnitId", "quantityPerUnit", "pictures", "notes", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
    [data.itemId, data.packagingUnitId, data.quantityPerUnit, JSON.stringify(data.pictures ?? []), data.notes ?? null]
  );

export const updateItemPackagingQuery = async (data: EditItemPackagingData): Promise<ItemPackaging> =>
  callQuery<ItemPackaging>(
    `UPDATE "ItemPackaging" SET "packagingUnitId" = $1, "quantityPerUnit" = $2, "pictures" = $3, "notes" = $4, "updatedAt" = NOW()
     WHERE "id" = $5 RETURNING *`,
    [data.packagingUnitId, data.quantityPerUnit, JSON.stringify(data.pictures ?? []), data.notes ?? null, data.id]
  );

export const deleteItemPackagingQuery = async (id: string): Promise<ItemPackaging> =>
  callQuery<ItemPackaging>(`DELETE FROM "ItemPackaging" WHERE "id" = $1 RETURNING *`, [id]);