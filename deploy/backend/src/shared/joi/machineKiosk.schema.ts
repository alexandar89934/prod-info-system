import Joi from "joi";

export const VerifyKioskAccessSchema = Joi.object({
  employeeNumber: Joi.string().required(),
  pin: Joi.string().allow("").optional(),
});