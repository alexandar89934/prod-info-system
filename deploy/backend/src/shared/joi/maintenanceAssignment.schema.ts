import Joi from "joi";

export const CreateMaintenanceAssignmentsSchema = Joi.object({
  templateId: Joi.string().uuid().required(),
  targetType: Joi.string().valid('machine', 'equipment', 'mold', 'vehicle').required(),
  targetIds:  Joi.array().items(Joi.string().uuid()).min(1).required(),
});