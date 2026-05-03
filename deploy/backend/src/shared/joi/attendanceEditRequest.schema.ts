import Joi from "joi";

export const CreateAttendanceEditRequestSchema = Joi.object({
  attendanceId: Joi.string().uuid().required(),
  requestedBy: Joi.string().uuid().required(),
  originalValues: Joi.object().required(),
  newValues: Joi.object().required(),
  reason: Joi.string().min(1).required(),
});

export const ProcessAttendanceEditRequestSchema = Joi.object({
  approvedBy: Joi.string().uuid().required(),
  status: Joi.string().valid("approved", "rejected").required(),
  rejectReason: Joi.string().allow("", null).optional(),
});