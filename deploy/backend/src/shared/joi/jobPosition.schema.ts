import Joi from "joi";

export const CreateJobPositionSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(""),
  categoryId: Joi.number().integer().required(),
  responsibilities: Joi.array().items(Joi.string()).optional().default([]),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});

export const UpdateJobPositionSchema = Joi.object({
  id: Joi.number().integer().optional(),
  name: Joi.string().optional().allow(""),
  description: Joi.string().optional().allow(""),
  categoryId: Joi.number().integer().optional(),
  responsibilities: Joi.array().items(Joi.string()).optional().default([]),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});