import httpStatus from "http-status";

import {
  createProductionPlanQuery,
  deleteProductionPlanQuery,
  getAllProductionPlansByMachineQuery,
  getAllProductionPlansQuery,
  getMaxPositionForMachineQuery,
  getMoldCurrentMachineIdQuery,
  getPreviousActivePlanQuery,
  getProductionPlanByIdQuery,
  getProductionPlansByMachineQuery,
  getProductionPlansByOrderQuery,
  getQueuedPlansAfterPositionQuery,
  reorderProductionPlansQuery,
  updatePlanDatesQuery,
  updateProductionPlanQuery,
  updateProductionPlanStatusQuery,
} from "../models/productionPlan.model";
import { ApiError } from "../shared/error/ApiError";
import { CreateProductionPlanData, ProductionPlan, ProductionPlanStatus, ReorderPlanItem, UpdateProductionPlanData } from "./productionPlan.service.types";

// DB stores TIMESTAMP WITHOUT TIME ZONE as local-time strings. All computed dates must be
// formatted in local time (not UTC ISO) so they round-trip correctly through the DB.
const toLocalString = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const addMinutes = (dateStr: string, minutes: number): string =>
  toLocalString(new Date(new Date(dateStr).getTime() + minutes * 60 * 1000));

const calcDurationMinutes = (
  qty: number,
  cavities: number | null | undefined,
  cycleTimeSeconds: number | null | undefined,
  normPerShift: number | null | undefined
): number | null => {
  const effectiveCavities = cavities && cavities > 0 ? cavities : 1;
  const cycles = Math.ceil(qty / effectiveCavities);
  // normPerShift = cycles per shift; takes priority as the real-world production norm
  if (normPerShift && normPerShift > 0) return Math.ceil((cycles / normPerShift) * 480);
  if (cycleTimeSeconds && cycleTimeSeconds > 0) return Math.ceil((cycles * cycleTimeSeconds) / 60);
  return null;
};

const getMountingMinutes = async (
  plan: { moldId: string | null; machineId: string; position: number; moldMountingTimeMinutes?: number | null },
  prevMoldId: string | null | undefined
): Promise<number> => {
  if (!plan.moldId || !plan.moldMountingTimeMinutes) return 0;
  if (prevMoldId !== undefined) {
    return plan.moldId !== prevMoldId ? plan.moldMountingTimeMinutes : 0;
  }
  // No explicit previous mold provided — look up predecessor in DB
  const prevPlan = await getPreviousActivePlanQuery(plan.machineId, plan.position);
  if (prevPlan) {
    return plan.moldId !== prevPlan.moldId ? plan.moldMountingTimeMinutes : 0;
  }
  // First plan on machine: check if mold is already mounted
  const currentMachineId = await getMoldCurrentMachineIdQuery(plan.moldId);
  return currentMachineId === plan.machineId ? 0 : plan.moldMountingTimeMinutes;
};

const recalcAllQueuedDatesForMachine = async (machineId: string): Promise<void> => {
  const activePlans = await getProductionPlansByMachineQuery(machineId);
  const inProgressPlan = activePlans.find((p) => p.status === 'in_progress');
  const queuedPlans = activePlans
    .filter((p) => p.status === 'queued')
    .sort((a, b) => a.position - b.position);

  if (queuedPlans.length === 0) return;

  // Anchor is the end of in-progress plan, or the earliest start date across all queued plans.
  // Using the minimum (not queuedPlans[0].expectedStartDate) preserves the original queue start
  // time when a plan is dragged to position 1 — the dragged plan's own stale start date would
  // otherwise shift the whole queue forward or backward.
  const minQueuedStart = queuedPlans.reduce<string | null>(
    (min, p) => (!p.expectedStartDate ? min : !min || p.expectedStartDate < min ? p.expectedStartDate : min),
    null
  );
  const anchorEnd = inProgressPlan?.expectedEndDate ?? minQueuedStart;
  if (!anchorEnd) return;

  let prevMoldId: string | null;
  if (inProgressPlan) {
    prevMoldId = inProgressPlan.moldId;
  } else {
    const firstMoldId = queuedPlans[0].moldId;
    if (firstMoldId) {
      const currentMachineId = await getMoldCurrentMachineIdQuery(firstMoldId);
      prevMoldId = currentMachineId === machineId ? firstMoldId : null;
    } else {
      prevMoldId = null;
    }
  }

  // Model: start = prevEnd (back-to-back), end = start + mounting + production
  let prevEndDate = anchorEnd;
  for (const plan of queuedPlans) {
    const mountingMinutes = await getMountingMinutes(plan, prevMoldId);
    const productionMinutes = calcDurationMinutes(plan.quantity, plan.cavities, plan.cycleTimeSeconds, plan.normPerShift);
    const endDate = productionMinutes !== null ? addMinutes(prevEndDate, mountingMinutes + productionMinutes) : null;
    await updatePlanDatesQuery(plan.id, prevEndDate, endDate);
    prevEndDate = endDate ?? prevEndDate;
    prevMoldId = plan.moldId;
  }
};

const cascadePlanDates = async (updatedPlan: ProductionPlan): Promise<void> => {
  // Model: start = when job begins (mounting start), end = start + mounting + production.
  // Mounting is part of the plan's own duration, not a gap before start.
  let anchorEndDate = updatedPlan.expectedEndDate;

  if (updatedPlan.expectedStartDate) {
    const mountingMinutes = await getMountingMinutes(updatedPlan, undefined);
    const productionMinutes = calcDurationMinutes(updatedPlan.quantity, updatedPlan.cavities, updatedPlan.cycleTimeSeconds, updatedPlan.normPerShift);
    if (productionMinutes !== null) {
      anchorEndDate = addMinutes(updatedPlan.expectedStartDate, mountingMinutes + productionMinutes);
      await updatePlanDatesQuery(updatedPlan.id, updatedPlan.expectedStartDate, anchorEndDate);
    }
  }

  if (!anchorEndDate) return;

  // Subsequent queued plans: start = prevEnd (back-to-back), end = start + mounting + production
  const subsequent = await getQueuedPlansAfterPositionQuery(updatedPlan.machineId, updatedPlan.position);
  let prevMoldId: string | null = updatedPlan.moldId;
  let prevEndDate = anchorEndDate;

  for (const plan of subsequent) {
    const mountingMinutes = await getMountingMinutes(plan, prevMoldId);
    const productionMinutes = calcDurationMinutes(plan.quantity, plan.cavities, plan.cycleTimeSeconds, plan.normPerShift);
    const endDate = productionMinutes !== null ? addMinutes(prevEndDate, mountingMinutes + productionMinutes) : null;
    await updatePlanDatesQuery(plan.id, prevEndDate, endDate);
    prevEndDate = endDate ?? prevEndDate;
    prevMoldId = plan.moldId;
  }
};

export const getAllProductionPlans = async (
  limit: number, offset: number, machineId?: string, status?: string
) => {
  try {
    return await getAllProductionPlansQuery(limit, offset, machineId, status);
  } catch (error) {
    throw new ApiError("Error fetching production plans!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getProductionPlansByOrder = async (orderId: string): Promise<ProductionPlan[]> => {
  try {
    return await getProductionPlansByOrderQuery(orderId);
  } catch (error) {
    throw new ApiError("Error fetching plans for order!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getProductionPlansByMachine = async (machineId: string): Promise<ProductionPlan[]> => {
  try {
    return await getProductionPlansByMachineQuery(machineId);
  } catch (error) {
    throw new ApiError("Error fetching machine queue!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getProductionPlanById = async (id: string): Promise<ProductionPlan> => {
  try {
    const plan = await getProductionPlanByIdQuery(id);
    if (!plan) throw new ApiError("Production plan not found.", httpStatus.NOT_FOUND);
    return plan;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error fetching production plan!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createProductionPlan = async (data: CreateProductionPlanData): Promise<ProductionPlan> => {
  try {
    const maxPos = await getMaxPositionForMachineQuery(data.machineId);
    const position = maxPos + 1;
    const created = await createProductionPlanQuery(data, position);
    // Fetch with joins so cascadePlanDates has cavities, cycleTimeSeconds etc.
    const fullPlan = await getProductionPlanByIdQuery(created.id);
    if (!fullPlan) throw new ApiError("Production plan not found after creation.", httpStatus.NOT_FOUND);
    await cascadePlanDates(fullPlan);
    const result = await getProductionPlanByIdQuery(created.id);
    if (!result) throw new ApiError("Production plan not found after cascade.", httpStatus.NOT_FOUND);
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error creating production plan!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateProductionPlan = async (data: UpdateProductionPlanData): Promise<ProductionPlan> => {
  try {
    const existing = await getProductionPlanByIdQuery(data.id);
    if (!existing) throw new ApiError("Production plan not found.", httpStatus.NOT_FOUND);
    await updateProductionPlanQuery(data);
    const updated = await getProductionPlanByIdQuery(data.id);
    if (!updated) throw new ApiError("Production plan not found after update.", httpStatus.NOT_FOUND);
    await cascadePlanDates(updated);
    const result = await getProductionPlanByIdQuery(data.id);
    if (!result) throw new ApiError("Production plan not found after cascade.", httpStatus.NOT_FOUND);
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error updating production plan!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateProductionPlanStatus = async (
  id: string, status: ProductionPlanStatus, producedQuantity?: number | null
): Promise<ProductionPlan> => {
  try {
    const existing = await getProductionPlanByIdQuery(id);
    if (!existing) throw new ApiError("Production plan not found.", httpStatus.NOT_FOUND);
    return await updateProductionPlanStatusQuery(id, status, producedQuantity);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error updating production plan status!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteProductionPlan = async (id: string): Promise<ProductionPlan> => {
  try {
    const existing = await getProductionPlanByIdQuery(id);
    if (!existing) throw new ApiError("Production plan not found.", httpStatus.NOT_FOUND);
    return await deleteProductionPlanQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting production plan!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getAllProductionPlansByMachine = async (machineId: string, search?: string): Promise<ProductionPlan[]> => {
  try {
    return await getAllProductionPlansByMachineQuery(machineId, search);
  } catch (error) {
    throw new ApiError("Error fetching machine plans!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const reorderProductionPlans = async (machineId: string, updates: ReorderPlanItem[]): Promise<void> => {
  try {
    await reorderProductionPlansQuery(machineId, updates);
    await recalcAllQueuedDatesForMachine(machineId);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error reordering production plans!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};