import Joi from "joi";

export const CreateProductionPlanSchema = Joi.object({
  customerOrderLineId: Joi.string().uuid().allow(null, "").optional(),
  itemId: Joi.string().uuid().required(),
  machineId: Joi.string().uuid().required(),
  moldId: Joi.string().uuid().allow(null, "").optional(),
  quantity: Joi.number().integer().min(1).required(),
  expectedStartDate: Joi.string().isoDate().allow(null, "").optional(),
  expectedEndDate: Joi.string().isoDate().allow(null, "").optional(),
  notes: Joi.string().max(2000).allow(null, "").optional(),
  shift1: Joi.boolean().optional(),
  shift2: Joi.boolean().optional(),
  shift3: Joi.boolean().optional(),
});

export const UpdateProductionPlanSchema = Joi.object({
  customerOrderLineId: Joi.string().uuid().allow(null, "").optional(),
  itemId: Joi.string().uuid().required(),
  machineId: Joi.string().uuid().required(),
  moldId: Joi.string().uuid().allow(null, "").optional(),
  quantity: Joi.number().integer().min(1).required(),
  expectedStartDate: Joi.string().isoDate().allow(null, "").optional(),
  expectedEndDate: Joi.string().isoDate().allow(null, "").optional(),
  status: Joi.string().valid("queued", "in_progress", "done", "cancelled").required(),
  notes: Joi.string().max(2000).allow(null, "").optional(),
  shift1: Joi.boolean().optional(),
  shift2: Joi.boolean().optional(),
  shift3: Joi.boolean().optional(),
});

export const UpdateProductionPlanStatusSchema = Joi.object({
  status: Joi.string().valid("queued", "in_progress", "done", "cancelled").required(),
  producedQuantity: Joi.number().integer().min(0).allow(null).optional(),
});

export const ReorderProductionPlansSchema = Joi.object({
  plans: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      position: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});