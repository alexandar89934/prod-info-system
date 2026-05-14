import { ProductionPlan, CreateProductionPlanData, UpdateProductionPlanData, ProductionPlanStatus, ReorderPlanItem } from "../service/productionPlan.service.types";
import { pool } from "../infrastructure/db";
import { DBError } from "../shared/error/DBError";
import { callQuery } from "./utils/query";


const PLAN_JOIN = `
  FROM "ProductionPlan" pp
  LEFT JOIN "Items" i ON i."id" = pp."itemId"
  LEFT JOIN "Machines" mac ON mac."id" = pp."machineId"
  LEFT JOIN "Molds" mo ON mo."id" = pp."moldId"
  LEFT JOIN "CustomerOrderLines" col ON col."id" = pp."customerOrderLineId"
  LEFT JOIN "CustomerOrders" co ON co."id" = col."customerOrderId"
  LEFT JOIN "Companies" cmp ON cmp."id" = co."customerId"
  LEFT JOIN "MoldMachineCompatibility" mmc ON mmc."moldId" = pp."moldId" AND mmc."machineId" = pp."machineId"
`;

const PLAN_SELECT = `
  SELECT pp.*,
    i."itemCode", i."name" AS "itemName",
    mac."name" AS "machineName", mac."machineNumber",
    mo."inventoryNumber" AS "moldInventoryNumber", mo."name" AS "moldName", mo."cavities", mo."currentMachineId" AS "moldCurrentMachineId",
    co."orderNumber", cmp."name" AS "customerName",
    mmc."normPerShift", mmc."cycleTimeSeconds", mmc."runnerWeightG", mmc."moldMountingTimeMinutes"
`;

export const getAllProductionPlansQuery = async (
  limit: number, offset: number, machineId?: string, status?: string
): Promise<{ rows: ProductionPlan[]; total: number }> => {
  const filters: string[] = [];
  const params: (string | number)[] = [limit, offset];
  let idx = 3;
  if (machineId) { filters.push(`pp."machineId" = $${idx++}`); params.push(machineId); }
  if (status) { filters.push(`pp."status" = $${idx++}`); params.push(status); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const countFilters: string[] = [];
  const countParams: (string | number)[] = [];
  let cidx = 1;
  if (machineId) { countFilters.push(`pp."machineId" = $${cidx++}`); countParams.push(machineId); }
  if (status) { countFilters.push(`pp."status" = $${cidx++}`); countParams.push(status); }
  const countWhere = countFilters.length ? `WHERE ${countFilters.join(" AND ")}` : "";

  const [rows, counts] = await Promise.all([
    callQuery<ProductionPlan[]>(
      `${PLAN_SELECT} ${PLAN_JOIN} ${where} ORDER BY pp."machineId", pp."position" ASC LIMIT $1 OFFSET $2`,
      params, true
    ),
    callQuery<{ count: string }[]>(
      `SELECT COUNT(*) FROM "ProductionPlan" pp ${countWhere}`,
      countParams, true
    ),
  ]);
  return { rows: rows ?? [], total: parseInt(counts?.[0]?.count ?? "0", 10) };
};

export const getProductionPlansByMachineQuery = async (machineId: string): Promise<ProductionPlan[]> =>
  callQuery<ProductionPlan[]>(
    `${PLAN_SELECT} ${PLAN_JOIN} WHERE pp."machineId" = $1 AND pp."status" NOT IN ('done', 'cancelled') ORDER BY pp."position" ASC`,
    [machineId], true
  ) ?? [];

export const getProductionPlanByIdQuery = async (id: string): Promise<ProductionPlan | null> =>
  callQuery<ProductionPlan>(`${PLAN_SELECT} ${PLAN_JOIN} WHERE pp."id" = $1`, [id]);

export const getMaxPositionForMachineQuery = async (machineId: string): Promise<number> => {
  const result = await callQuery<{ max: number | null }>(
    `SELECT MAX("position") AS max FROM "ProductionPlan" WHERE "machineId" = $1 AND "status" NOT IN ('done', 'cancelled')`,
    [machineId]
  );
  return result?.max ?? 0;
};

export const createProductionPlanQuery = async (
  data: CreateProductionPlanData, position: number
): Promise<ProductionPlan> =>
  callQuery<ProductionPlan>(
    `INSERT INTO "ProductionPlan"
       ("id", "customerOrderLineId", "itemId", "machineId", "moldId",
        "quantity", "expectedStartDate", "expectedEndDate", "position", "status", "notes", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'queued', $9, NOW(), NOW())
     RETURNING *`,
    [
      data.customerOrderLineId ?? null,
      data.itemId, data.machineId, data.moldId ?? null,
      data.quantity,
      data.expectedStartDate ?? null, data.expectedEndDate ?? null,
      position,
      data.notes ?? null,
    ]
  );

export const updateProductionPlanQuery = async (data: UpdateProductionPlanData): Promise<ProductionPlan> =>
  callQuery<ProductionPlan>(
    `UPDATE "ProductionPlan" SET
       "customerOrderLineId" = $1, "itemId" = $2, "machineId" = $3, "moldId" = $4,
       "quantity" = $5, "expectedStartDate" = $6, "expectedEndDate" = $7,
       "status" = $8, "notes" = $9, "updatedAt" = NOW()
     WHERE "id" = $10 RETURNING *`,
    [
      data.customerOrderLineId ?? null,
      data.itemId, data.machineId, data.moldId ?? null,
      data.quantity,
      data.expectedStartDate ?? null, data.expectedEndDate ?? null,
      data.status, data.notes ?? null, data.id,
    ]
  );

export const updateProductionPlanStatusQuery = async (
  id: string, status: ProductionPlanStatus, producedQuantity?: number | null
): Promise<ProductionPlan> =>
  callQuery<ProductionPlan>(
    `UPDATE "ProductionPlan" SET "status" = $1, "producedQuantity" = COALESCE($2, "producedQuantity"), "updatedAt" = NOW() WHERE "id" = $3 RETURNING *`,
    [status, producedQuantity ?? null, id]
  );

export const getProductionPlansByOrderQuery = async (orderId: string): Promise<ProductionPlan[]> =>
  callQuery<ProductionPlan[]>(
    `${PLAN_SELECT} ${PLAN_JOIN}
     WHERE pp."customerOrderLineId" IN (
       SELECT id FROM "CustomerOrderLines" WHERE "customerOrderId" = $1
     )
     ORDER BY pp."machineId", pp."position" ASC`,
    [orderId], true
  ) ?? [];

export const deleteProductionPlanQuery = async (id: string): Promise<ProductionPlan> =>
  callQuery<ProductionPlan>(`DELETE FROM "ProductionPlan" WHERE "id" = $1 RETURNING *`, [id]);

export const getAllProductionPlansByMachineQuery = async (
  machineId: string, search?: string
): Promise<ProductionPlan[]> => {
  const params: (string | number)[] = [machineId];
  let searchFilter = '';
  if (search) {
    params.push(`%${search}%`);
    searchFilter = ` AND (i."itemCode" ILIKE $2 OR i."name" ILIKE $2 OR mo."inventoryNumber" ILIKE $2)`;
  }
  return callQuery<ProductionPlan[]>(
    `${PLAN_SELECT} ${PLAN_JOIN} WHERE pp."machineId" = $1${searchFilter} ORDER BY pp."position" ASC`,
    params, true
  ) ?? [];
};

export const incrementProducedQuantityQuery = async (
  id: string, quantity: number
): Promise<void> => {
  await callQuery<ProductionPlan>(
    `UPDATE "ProductionPlan"
     SET "producedQuantity" = COALESCE("producedQuantity", 0) + $1, "updatedAt" = NOW()
     WHERE "id" = $2`,
    [quantity, id]
  );
};

export const incrementScrapQuantityQuery = async (
  id: string, quantity: number
): Promise<void> => {
  await callQuery<ProductionPlan>(
    `UPDATE "ProductionPlan"
     SET "scrapQuantity" = COALESCE("scrapQuantity", 0) + $1, "updatedAt" = NOW()
     WHERE "id" = $2`,
    [quantity, id]
  );
};

export const getQueuedPlansAfterPositionQuery = async (
  machineId: string, position: number
): Promise<ProductionPlan[]> =>
  callQuery<ProductionPlan[]>(
    `${PLAN_SELECT} ${PLAN_JOIN}
     WHERE pp."machineId" = $1 AND pp."status" = 'queued' AND pp."position" > $2
     ORDER BY pp."position" ASC`,
    [machineId, position], true
  ) ?? [];

export const updatePlanDatesQuery = async (
  id: string, expectedStartDate: string | null, expectedEndDate: string | null
): Promise<void> => {
  await callQuery<ProductionPlan>(
    `UPDATE "ProductionPlan"
     SET "expectedStartDate" = $1, "expectedEndDate" = $2, "updatedAt" = NOW()
     WHERE "id" = $3`,
    [expectedStartDate, expectedEndDate, id]
  );
};

export const getMoldCurrentMachineIdQuery = async (moldId: string): Promise<string | null> => {
  const result = await callQuery<{ currentMachineId: string | null }>(
    `SELECT "currentMachineId" FROM "Molds" WHERE "id" = $1`,
    [moldId]
  );
  return result?.currentMachineId ?? null;
};

export const getPreviousActivePlanQuery = async (
  machineId: string, position: number
): Promise<ProductionPlan | null> =>
  callQuery<ProductionPlan>(
    `${PLAN_SELECT} ${PLAN_JOIN}
     WHERE pp."machineId" = $1 AND pp."position" < $2 AND pp."status" NOT IN ('done', 'cancelled')
     ORDER BY pp."position" DESC LIMIT 1`,
    [machineId, position]
  ) ?? null;

export const reorderProductionPlansQuery = async (
  machineId: string, updates: ReorderPlanItem[]
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const { id, position } of updates) {
      await client.query(
        `UPDATE "ProductionPlan" SET "position" = $1, "updatedAt" = NOW()
         WHERE "id" = $2 AND "machineId" = $3 AND "status" = 'queued'`,
        [position, id, machineId]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    const message = err instanceof Error ? err.message : String(err);
    throw new DBError(message);
  } finally {
    client.release();
  }
};