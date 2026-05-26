import { ApiResponse } from '@/state/defaultResponse.ts';

export type ProductionPlanActionType =
  | 'mold_change_started'
  | 'mold_change_completed'
  | 'machine_setup_started'
  | 'machine_setup_completed'
  | 'cycle_completed'
  | 'plan_started'
  | 'first_good_part_approved'
  | 'operator_started'
  | 'operator_ended'
  | 'scrap_entry'
  | 'qty_increased'
  | 'packaging_unit_full'
  | 'quality_checked'
  | 'plan_stopped'
  | 'plan_completed'
  | 'plan_change_started'
  | 'machine_service_started'
  | 'machine_service_ended'
  | 'machine_repair_started'
  | 'machine_repair_ended'
  | 'plan_resumed'
  | 'machine_fault_reported'
  | 'plan_created'
  | 'plan_updated'
  | 'order_created'
  | 'order_updated';

export type ProductionPlanAction = {
  id: string;
  productionPlanId: string | null;
  customerOrderId?: string | null;
  actionType: ProductionPlanActionType;
  performedByPersonId: string | null;
  performedByName: string | null;
  performedByPersonName: string | null;
  quantity: number | null;
  scrapReason: string | null;
  packagingUnitId: string | null;
  packagingUnitName: string | null;
  notes: string | null;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductionPlanActionData = {
  productionPlanId?: string | null;
  customerOrderId?: string | null;
  actionType: ProductionPlanActionType;
  performedByPersonId?: string | null;
  performedByName?: string | null;
  quantity?: number | null;
  scrapReason?: string | null;
  packagingUnitId?: string | null;
  packagingUnitName?: string | null;
  notes?: string | null;
  timestamp?: string;
};

export type ProductionPlanActionState = {
  actionsByPlan: Record<string, ProductionPlanAction[]>;
  loading: boolean;
  error: string | null;
  success: string | null;
};

export type ProductionPlanActionListResponse = ApiResponse<{ actions: ProductionPlanAction[] }>;
export type ProductionPlanActionSingleResponse = ApiResponse<{ action: ProductionPlanAction }>;