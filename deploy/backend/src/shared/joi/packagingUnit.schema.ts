import Joi from "joi";

const fileRefSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required(),
  dateAdded: Joi.alternatives(Joi.date(), Joi.string()).required(),
});

export const CreatePackagingUnitSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().optional().allow("", null),
  picture: fileRefSchema.optional().allow(null),
});

export const UpdatePackagingUnitSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  name: Joi.string().max(100).optional(),
  description: Joi.string().optional().allow("", null),
  picture: fileRefSchema.optional().allow(null),
});