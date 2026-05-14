import Joi from "joi";

const CATEGORIES = ["raw_material", "masterbatch", "component", "semi_finished", "finished_good", "regrind", "packaging"];
const UNITS = ["g", "kg", "kom", "m", "m2"];
const APPROVAL_LEVELS = ["qc_controller", "shift_manager"];

const fileRefSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required(),
  dateAdded: Joi.alternatives(Joi.date(), Joi.string()).required(),
});

export const CreateItemSchema = Joi.object({
  itemCode: Joi.string().max(20).required(),
  name: Joi.string().required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  unit: Joi.string().valid(...UNITS).required(),
  priceEurPerUnit: Joi.number().positive().optional().allow(null),
  pieceWeightG: Joi.number().positive().optional().allow(null),
  runnerWeightG: Joi.number().min(0).optional().allow(null),
  normPerShift: Joi.number().integer().positive().optional().allow(null),
  piecesPerPackagingUnit: Joi.number().integer().positive().optional().allow(null),
  approvalLevel: Joi.string().valid(...APPROVAL_LEVELS).optional().allow(null),
  toolId: Joi.string().uuid().optional().allow(null),
  pictures: Joi.array().items(fileRefSchema).optional().allow(null),
  documents: Joi.array().items(fileRefSchema).optional().allow(null),
  notes: Joi.string().optional().allow("", null),
});

export const UpdateItemSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  itemCode: Joi.string().max(20).optional(),
  name: Joi.string().optional(),
  category: Joi.string().valid(...CATEGORIES).optional(),
  unit: Joi.string().valid(...UNITS).optional(),
  priceEurPerUnit: Joi.number().positive().optional().allow(null),
  pieceWeightG: Joi.number().positive().optional().allow(null),
  runnerWeightG: Joi.number().min(0).optional().allow(null),
  normPerShift: Joi.number().integer().positive().optional().allow(null),
  piecesPerPackagingUnit: Joi.number().integer().positive().optional().allow(null),
  approvalLevel: Joi.string().valid(...APPROVAL_LEVELS).optional().allow(null),
  toolId: Joi.string().uuid().optional().allow(null),
  pictures: Joi.array().items(fileRefSchema).optional().allow(null),
  documents: Joi.array().items(fileRefSchema).optional().allow(null),
  notes: Joi.string().optional().allow("", null),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});