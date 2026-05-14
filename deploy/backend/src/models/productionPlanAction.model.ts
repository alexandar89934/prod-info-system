import {
  ProductionPlanAction,
  CreateProductionPlanActionData,
} from "../service/productionPlanAction.service.types";

import { callQuery } from "./utils/query";

export const getActionsByPlanIdQuery = async (
  planId: string,
): Promise<ProductionPlanAction[]> => {
  const sql = `
    SELECT ppa.*, p."name" AS "performedByPersonName"
    FROM "ProductionPlanActions" ppa
    LEFT JOIN "Person" p ON p."id" = ppa."performedByPersonId"
    WHERE ppa."productionPlanId" = $1
    ORDER BY ppa."timestamp" ASC
  `;
  return callQuery<ProductionPlanAction[]>(sql, [planId], true) ?? [];
};

export const createActionQuery = async (
  data: CreateProductionPlanActionData,
): Promise<ProductionPlanAction> => {
  const sql = `
    INSERT INTO "ProductionPlanActions"
      ("id", "productionPlanId", "customerOrderId", "actionType", "performedByPersonId", "performedByName",
       "quantity", "scrapReason", "packagingUnitId", "packagingUnitName", "notes",
       "timestamp", "createdAt", "updatedAt")
    VALUES
      (gen_random_uuid(), $1, $2, $3::"enum_ProductionPlanActions_actionType", $4, $5,
       $6, $7, $8, $9, $10,
       $11, NOW(), NOW())
    RETURNING *
  `;
  return callQuery<ProductionPlanAction>(sql, [
    data.productionPlanId ?? null,
    data.customerOrderId ?? null,
    data.actionType,
    data.performedByPersonId ?? null,
    data.performedByName ?? null,
    data.quantity ?? null,
    data.scrapReason ?? null,
    data.packagingUnitId ?? null,
    data.packagingUnitName ?? null,
    data.notes ?? null,
    data.timestamp ?? new Date().toISOString(),
  ]);
};
