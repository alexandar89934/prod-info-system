import Joi from "joi";

export const CreateLeaveRecordSchema = Joi.object({
  personId: Joi.string().uuid().required(),
  type: Joi.string().valid("vacation", "sick", "other").required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  isHalfDay: Joi.boolean().optional(),
  halfDayPart: Joi.string().valid("morning", "afternoon").allow(null).optional(),
  requestNote: Joi.string().allow("", null).optional(),
  documents: Joi.array().items(Joi.string()).optional(),
});

export const ApproveLeaveRecordSchema = Joi.object({
  approvedBy: Joi.string().uuid().required(),
  status: Joi.string().valid("approved", "rejected").required(),
  rejectReason: Joi.string().allow("", null).optional(),
});

export const UpsertLeaveBalanceSchema = Joi.object({
  personId: Joi.string().uuid().required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
  totalVacationDays: Joi.number().min(0).max(365).required(),
});