import Joi from "joi";

const fileRefSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required(),
  dateAdded: Joi.alternatives(Joi.date(), Joi.string()).required(),
});

export const CreateItemPackagingSchema = Joi.object({
  packagingUnitId: Joi.string().uuid().required(),
  quantityPerUnit: Joi.number().integer().positive().required(),
  pictures: Joi.array().items(fileRefSchema).optional().default([]),
  notes: Joi.string().optional().allow("", null),
});

export const UpdateItemPackagingSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  packagingUnitId: Joi.string().uuid().optional(),
  quantityPerUnit: Joi.number().integer().positive().optional(),
  pictures: Joi.array().items(fileRefSchema).optional(),
  notes: Joi.string().optional().allow("", null),
});