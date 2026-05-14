export type ProductionPlanStatus = "queued" | "in_progress" | "done" | "cancelled";

export type ProductionPlan = {
  id: string;
  customerOrderLineId: string | null;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  machineId: string;
  machineName?: string;
  machineNumber?: number;
  moldId: string | null;
  moldInventoryNumber?: string | null;
  moldName?: string | null;
  quantity: number;
  producedQuantity: number | null;
  expectedStartDate: string | null;
  expectedEndDate: string | null;
  position: number;
  status: ProductionPlanStatus;
  notes: string | null;
  orderNumber?: string | null;
  customerName?: string | null;
  normPerShift?: number | null;
  cycleTimeSeconds?: number | null;
  cavities?: number | null;
  runnerWeightG?: number | null;
  moldMountingTimeMinutes?: number | null;
  moldCurrentMachineId?: string | null;
  scrapQuantity?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductionPlanData = {
  customerOrderLineId?: string | null;
  itemId: string;
  machineId: string;
  moldId?: string | null;
  quantity: number;
  expectedStartDate?: string | null;
  expectedEndDate?: string | null;
  notes?: string | null;
};

export type ReorderPlanItem = { id: string; position: number };

export type UpdateProductionPlanData = {
  id: string;
  customerOrderLineId?: string | null;
  itemId: string;
  machineId: string;
  moldId?: string | null;
  quantity: number;
  expectedStartDate?: string | null;
  expectedEndDate?: string | null;
  status: ProductionPlanStatus;
  notes?: string | null;
};