import Joi from "joi";

export const CreateResponsibilitySchema = Joi.object({
  code: Joi.string()
    .pattern(/^[a-z0-9_]+$/)
    .max(100)
    .required()
    .messages({
      "string.pattern.base":
        "Code must contain only lowercase letters, digits, and underscores.",
    }),
  label: Joi.string().max(200).required(),
  description: Joi.string().optional().allow("", null),
});

export const UpdateResponsibilitySchema = Joi.object({
  label: Joi.string().max(200).required(),
  description: Joi.string().optional().allow("", null),
});