import Joi from "joi";

const stepSchema = Joi.object({
  stepOrder: Joi.number().integer().min(1).required(),
  description: Joi.string().max(500).min(1).required(),
  isRequired: Joi.boolean().required(),
});

export const CreateMaintenanceTemplateSchema = Joi.object({
  name: Joi.string().max(200).min(1).required(),
  targetType: Joi.string().valid("machine", "equipment", "mold", "vehicle").required(),
  intervalType: Joi.string().valid("days", "injections", "on_demand").required(),
  intervalValue: Joi.number().integer().min(1).allow(null).optional(),
  notes: Joi.string().optional().allow("", null),
  steps: Joi.array().items(stepSchema).min(1).required(),
});

export const UpdateMaintenanceTemplateSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  name: Joi.string().max(200).min(1).required(),
  targetType: Joi.string().valid("machine", "equipment", "mold", "vehicle").required(),
  intervalType: Joi.string().valid("days", "injections", "on_demand").required(),
  intervalValue: Joi.number().integer().min(1).allow(null).optional(),
  notes: Joi.string().optional().allow("", null),
  steps: Joi.array().items(stepSchema).min(1).required(),
});