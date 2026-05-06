import Joi from "joi";

const UNITS = ["g", "kg", "kom", "m", "m2"];

export const CreateBomLineSchema = Joi.object({
  outputItemId: Joi.string().uuid().required(),
  inputItemId: Joi.string().uuid().required(),
  quantityPerPiece: Joi.number().positive().required(),
  unit: Joi.string().valid(...UNITS).required(),
  notes: Joi.string().optional().allow("", null),
});

export const UpdateBomLineSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  outputItemId: Joi.string().uuid().optional(),
  inputItemId: Joi.string().uuid().required(),
  quantityPerPiece: Joi.number().positive().required(),
  unit: Joi.string().valid(...UNITS).required(),
  notes: Joi.string().optional().allow("", null),
});