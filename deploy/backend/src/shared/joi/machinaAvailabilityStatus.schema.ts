import Joi from "joi";

export const CreateMachineAvailabilityStatusSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(""),
  createdBy: Joi.string().optional().allow(""),
  updatedBy: Joi.string().optional().allow(""),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});

export const UpdateMachineAvailabilityStatusSchema = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().optional().allow(""),
  description: Joi.string().optional().allow(""),
  createdBy: Joi.string().optional().allow(""),
  updatedBy: Joi.string().optional().allow(""),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});
