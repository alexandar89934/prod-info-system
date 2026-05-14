import { z } from 'zod';
import { ApiResponse } from '@/state/defaultResponse.ts';
import { productionPlanSchema, updateProductionPlanSchema } from '@/zodValidationSchemas/productionPlan.schema.ts';

export type ProductionPlanStatus = 'queued' | 'in_progress' | 'done' | 'cancelled';

export type ProductionPlan = z.infer<typeof productionPlanSchema> & {
  id: string;
  status: ProductionPlanStatus;
  position: number;
  producedQuantity: number | null;
  itemCode?: string;
  itemName?: string;
  machineName?: string;
  machineNumber?: number;
  moldInventoryNumber?: string | null;
  moldName?: string | null;
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

export type CreateProductionPlanFormData = z.infer<typeof productionPlanSchema>;
export type UpdateProductionPlanFormData = z.infer<typeof updateProductionPlanSchema> & { id: string };

export type ProductionPlanSingleResponse = ApiResponse<{ productionPlan: ProductionPlan }>;
export type ProductionPlanListResponse = ApiResponse<{
  productionPlans: ProductionPlan[];
  pagination: { total: number; page: number; limit: number };
}>;

export type ProductionPlanState = {
  currentPlan: ProductionPlan | null;
  plans: ProductionPlan[];
  plansByMachine: ProductionPlan[];
  plansByOrder: ProductionPlan[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchProductionPlanParams = {
  page: number;
  limit: number;
  machineId?: string;
  status?: string;
};

export type ReorderPlanItem = { id: string; position: number };

export type FetchAllByMachineParams = {
  machineId: string;
  search?: string;
};