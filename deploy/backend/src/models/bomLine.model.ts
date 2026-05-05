import { BomLine, CreateBomLineData, EditBomLineData } from "../service/bomLine.service.types";
import { callQuery } from "./utils/query";

export const getBomLinesByOutputItemQuery = async (outputItemId: string): Promise<BomLine[]> => {
  const sql = `
    SELECT bl.*, i."itemCode" AS "inputItemCode", i."name" AS "inputItemName", i."unit" AS "inputItemUnit"
    FROM "BomLines" bl
    JOIN "Items" i ON i."id" = bl."inputItemId"
    WHERE bl."outputItemId" = $1
    ORDER BY i."itemCode" ASC
  `;
  return callQuery<BomLine[]>(sql, [outputItemId], true) || [];
};

export const getBomLineByIdQuery = async (id: string): Promise<BomLine> => {
  const sql = `
    SELECT bl.*, i."itemCode" AS "inputItemCode", i."name" AS "inputItemName", i."unit" AS "inputItemUnit"
    FROM "BomLines" bl
    JOIN "Items" i ON i."id" = bl."inputItemId"
    WHERE bl."id" = $1
  `;
  return callQuery<BomLine>(sql, [id]);
};

export const createBomLineQuery = async (data: CreateBomLineData): Promise<BomLine> => {
  const sql = `
    INSERT INTO "BomLines"
      ("id", "outputItemId", "inputItemId", "quantityPerPiece", "unit", "notes", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4::"enum_BomLines_unit", $5, NOW(), NOW())
    RETURNING *
  `;
  return callQuery<BomLine>(sql, [
    data.outputItemId,
    data.inputItemId,
    data.quantityPerPiece,
    data.unit,
    data.notes ?? null,
  ]);
};

export const updateBomLineQuery = async (data: EditBomLineData): Promise<BomLine> => {
  const sql = `
    UPDATE "BomLines" SET
      "inputItemId" = $1,
      "quantityPerPiece" = $2,
      "unit" = $3::"enum_BomLines_unit",
      "notes" = $4,
      "updatedAt" = NOW()
    WHERE "id" = $5
    RETURNING *
  `;
  return callQuery<BomLine>(sql, [
    data.inputItemId,
    data.quantityPerPiece,
    data.unit,
    data.notes ?? null,
    data.id,
  ]);
};

export const deleteBomLineQuery = async (id: string): Promise<BomLine> => {
  const sql = `DELETE FROM "BomLines" WHERE "id" = $1 RETURNING *`;
  return callQuery<BomLine>(sql, [id]);
};