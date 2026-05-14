import Joi from "joi";

const ACTION_TYPES = [
  "mold_change_started", "mold_change_completed", "plan_started", "first_good_part_approved",
  "operator_started", "operator_changed", "scrap_entry", "qty_increased",
  "packaging_unit_full", "quality_checked", "plan_stopped", "plan_completed", "plan_change_started",
  "machine_service_started", "machine_service_ended", "machine_repair_started", "machine_repair_ended",
  "plan_resumed", "machine_fault_reported",
  "plan_created", "plan_updated", "order_created", "order_updated",
] as const;

const SCRAP_REASONS = ["machine", "regler", "tool", "worker", "material", "aesthetics"] as const;

export const VerifyActionPermissionSchema = Joi.object({
  employeeNumber: Joi.string().required(),
  pin: Joi.string().allow("").optional(),
  actionType: Joi.string().valid(...ACTION_TYPES).required(),
});

export const CreateProductionPlanActionSchema = Joi.object({
  productionPlanId: Joi.string().uuid().allow(null, "").optional(),
  customerOrderId: Joi.string().uuid().allow(null, "").optional(),
  actionType: Joi.string().valid(...ACTION_TYPES).required(),
  performedByPersonId: Joi.string().uuid().allow(null, "").optional(),
  performedByName: Joi.string().max(200).allow(null, "").optional(),
  quantity: Joi.number().integer().min(0).allow(null).optional(),
  scrapReason: Joi.string().valid(...SCRAP_REASONS).allow(null, "").optional(),
  packagingUnitId: Joi.string().uuid().allow(null, "").optional(),
  packagingUnitName: Joi.string().max(200).allow(null, "").optional(),
  notes: Joi.string().max(1000).allow(null, "").optional(),
  timestamp: Joi.string().isoDate().optional(),
});