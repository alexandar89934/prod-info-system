import Joi from "joi";

export const UpdateSystemConfigSchema = Joi.object({
  value: Joi.string().max(255).required(),
});