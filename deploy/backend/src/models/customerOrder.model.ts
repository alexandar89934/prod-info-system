import { CustomerOrder, CustomerOrderLine, CreateCustomerOrderData, UpdateCustomerOrderData } from "../service/customerOrder.service.types";
import { callQuery } from "./utils/query";

export const getAllCustomerOrdersQuery = async (
  search: string, limit: number, offset: number, status?: string
): Promise<{ rows: CustomerOrder[]; total: number }> => {
  const param = `%${search}%`;
  const statusFilter = status ? `AND co."status" = '${status}'` : "";
  const [rows, counts] = await Promise.all([
    callQuery<CustomerOrder[]>(
      `SELECT co.*, c."name" AS "customerName"
       FROM "CustomerOrders" co
       LEFT JOIN "Companies" c ON c."id" = co."customerId"
       WHERE (co."orderNumber" ILIKE $1 OR c."name" ILIKE $1) ${statusFilter}
       ORDER BY co."createdAt" DESC LIMIT $2 OFFSET $3`,
      [param, limit, offset], true
    ),
    callQuery<{ count: string }[]>(
      `SELECT COUNT(*) FROM "CustomerOrders" co
       LEFT JOIN "Companies" c ON c."id" = co."customerId"
       WHERE (co."orderNumber" ILIKE $1 OR c."name" ILIKE $1) ${statusFilter}`,
      [param], true
    ),
  ]);
  return { rows: rows ?? [], total: parseInt(counts?.[0]?.count ?? "0", 10) };
};

export const getCustomerOrderByIdQuery = async (id: string): Promise<CustomerOrder | null> => {
  const order = await callQuery<CustomerOrder>(
    `SELECT co.*, c."name" AS "customerName"
     FROM "CustomerOrders" co
     LEFT JOIN "Companies" c ON c."id" = co."customerId"
     WHERE co."id" = $1`,
    [id]
  );
  if (!order) return null;
  const lines = await callQuery<CustomerOrderLine[]>(
    `SELECT col.*, i."itemCode", i."name" AS "itemName"
     FROM "CustomerOrderLines" col
     LEFT JOIN "Items" i ON i."id" = col."itemId"
     WHERE col."customerOrderId" = $1
     ORDER BY col."createdAt" ASC`,
    [id], true
  );
  return { ...order, lines: lines ?? [] };
};

export const createCustomerOrderQuery = async (
  data: CreateCustomerOrderData
): Promise<CustomerOrder> => {
  const order = await callQuery<CustomerOrder>(
    `INSERT INTO "CustomerOrders"
       ("id", "orderNumber", "customerId", "deliveryDate", "notes", "status", "createdAt", "updatedAt")
     VALUES (
       gen_random_uuid(),
       'CO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('customer_orders_number_seq')::text, 4, '0'),
       $1, $2, $3, 'open', NOW(), NOW()
     ) RETURNING *`,
    [data.customerId, data.deliveryDate ?? null, data.notes ?? null]
  );
  if (data.lines?.length) {
    for (const line of data.lines) {
      await callQuery(
        `INSERT INTO "CustomerOrderLines" ("id", "customerOrderId", "itemId", "quantity", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())`,
        [order.id, line.itemId, line.quantity]
      );
    }
  }
  return order;
};

export const updateCustomerOrderQuery = async (data: UpdateCustomerOrderData): Promise<CustomerOrder> =>
  callQuery<CustomerOrder>(
    `UPDATE "CustomerOrders" SET
       "customerId" = $1, "deliveryDate" = $2, "notes" = $3, "status" = $4, "updatedAt" = NOW()
     WHERE "id" = $5 RETURNING *`,
    [data.customerId, data.deliveryDate ?? null, data.notes ?? null, data.status, data.id]
  );

export const deleteCustomerOrderQuery = async (id: string): Promise<CustomerOrder> =>
  callQuery<CustomerOrder>(`DELETE FROM "CustomerOrders" WHERE "id" = $1 RETURNING *`, [id]);

export const getCustomerOrderLinesQuery = async (customerOrderId: string): Promise<CustomerOrderLine[]> =>
  callQuery<CustomerOrderLine[]>(
    `SELECT col.*, i."itemCode", i."name" AS "itemName"
     FROM "CustomerOrderLines" col
     LEFT JOIN "Items" i ON i."id" = col."itemId"
     WHERE col."customerOrderId" = $1 ORDER BY col."createdAt" ASC`,
    [customerOrderId], true
  ) ?? [];

export const addOrderLineQuery = async (
  customerOrderId: string, itemId: string, quantity: number
): Promise<CustomerOrderLine> => {
  const inserted = await callQuery<CustomerOrderLine>(
    `INSERT INTO "CustomerOrderLines" ("id", "customerOrderId", "itemId", "quantity", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING *`,
    [customerOrderId, itemId, quantity]
  );
  return callQuery<CustomerOrderLine>(
    `SELECT col.*, i."itemCode", i."name" AS "itemName"
     FROM "CustomerOrderLines" col
     LEFT JOIN "Items" i ON i."id" = col."itemId"
     WHERE col."id" = $1`,
    [inserted.id]
  );
};

export const deleteOrderLineQuery = async (lineId: string): Promise<CustomerOrderLine> =>
  callQuery<CustomerOrderLine>(
    `DELETE FROM "CustomerOrderLines" WHERE "id" = $1 RETURNING *`,
    [lineId]
  );