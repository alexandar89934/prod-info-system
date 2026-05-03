import Joi from "joi";

export const UserLoginSchema = Joi.object({
  identifier: Joi.string().empty("").required(),
  password: Joi.string().empty("").required(),
});

export const SetKioskPinSchema = Joi.object({
  pin: Joi.string().length(4).pattern(/^\d{4}$/).required().messages({
    "string.length": "PIN must be exactly 4 digits.",
    "string.pattern.base": "PIN must contain only digits.",
  }),
  confirmPin: Joi.string().valid(Joi.ref("pin")).required().messages({
    "any.only": "PINs do not match.",
  }),
});

export const ResetPasswordSchema = Joi.object({
  employeeNumber: Joi.string().empty("").required(),
  oldPassword: Joi.string().required().messages({
    "string.empty": "Old password is required",
  }),
  newPassword: Joi.string()
    .disallow(Joi.ref("oldPassword"))
    .required()
    .messages({
      "string.empty": "New password is required",
      "any.invalid": "New password must be different from old password",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Please confirm your new password",
    }),
});
