import Joi from "joi";

export const AdminLoginSchema = Joi.object({
  username: Joi.string().empty("").required(),
  password: Joi.string().empty("").required(),
});
