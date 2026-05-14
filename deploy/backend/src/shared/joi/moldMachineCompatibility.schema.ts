import Joi from "joi";

const PG_INT_MAX = 2147483647;

export const CreateMoldMachineCompatibilitySchema = Joi.object({
  moldId: Joi.string().uuid().required(),
  machineId: Joi.string().uuid().required(),
  cycleTimeSeconds: Joi.number().integer().min(0).max(PG_INT_MAX).optional().allow(null),
  startupScrapCount: Joi.number().integer().min(0).max(PG_INT_MAX).optional().allow(null),
  normPerShift: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  runnerWeightG: Joi.number().min(0).optional().allow(null),
  moldMountingTimeMinutes: Joi.number().integer().min(0).max(PG_INT_MAX).optional().allow(null),
  notes: Joi.string().optional().allow("", null),
  settingParameters: Joi.object().optional().allow(null),
});

export const UpdateMoldMachineCompatibilitySchema = Joi.object({
  id: Joi.string().uuid().optional(),
  cycleTimeSeconds: Joi.number().integer().min(0).max(PG_INT_MAX).optional().allow(null),
  startupScrapCount: Joi.number().integer().min(0).max(PG_INT_MAX).optional().allow(null),
  normPerShift: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  runnerWeightG: Joi.number().min(0).optional().allow(null),
  moldMountingTimeMinutes: Joi.number().integer().min(0).max(PG_INT_MAX).optional().allow(null),
  notes: Joi.string().optional().allow("", null),
  settingParameters: Joi.object().optional().allow(null),
});