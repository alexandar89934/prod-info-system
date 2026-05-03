import Joi from "joi";

export const KioskActionSchema = Joi.object({
  rfidCardNumber: Joi.string().when("employeeNumber", {
    is: Joi.exist(),
    then: Joi.optional().allow("", null),
    otherwise: Joi.required(),
  }),
  employeeNumber: Joi.string().optional(),
  pin: Joi.string().length(4).when("employeeNumber", {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  action: Joi.string().valid("checkout", "break").optional(),
}).or("rfidCardNumber", "employeeNumber");

export const ManualAttendanceCreateSchema = Joi.object({
  personId: Joi.string().uuid().required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  checkIn: Joi.string().isoDate().required(),
  checkOut: Joi.string().isoDate().optional(),
  shiftType: Joi.string().valid("first", "second", "night").optional(),
  note: Joi.string().allow("").optional(),
});

export const ManualAttendanceUpdateSchema = Joi.object({
  checkIn: Joi.string().isoDate().optional(),
  checkOut: Joi.string().isoDate().optional(),
  workMinutes: Joi.number().integer().min(0).optional(),
  regularMinutes: Joi.number().integer().min(0).optional(),
  overtimeMinutes: Joi.number().integer().min(0).optional(),
  nightMinutes: Joi.number().integer().min(0).optional(),
  weekendMinutes: Joi.number().integer().min(0).optional(),
  shiftType: Joi.string().valid("first", "second", "night").optional(),
  note: Joi.string().allow("").optional(),
}).min(1);

export const OvertimeApprovalSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
});