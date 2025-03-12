import Joi from "joi";

export const UserLoginSchema = Joi.object({
  employeeNumber: Joi.string().empty("").required(),
  password: Joi.string().empty("").required(),
});
