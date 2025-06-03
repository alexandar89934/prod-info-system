import Joi from "joi";

export const CreateWorkplaceCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(""),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});

export const UpdateWorkplaceCategorySchema = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().optional().allow(""),
  description: Joi.string().optional().allow(""),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});
