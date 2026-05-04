import Joi from "joi";

const PG_INT_MAX = 2147483647;

const temperingZoneSchema = Joi.object({
  zone: Joi.string().required(),
  minTemp: Joi.number().required(),
  maxTemp: Joi.number().required(),
});

const fileSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required(),
  dateAdded: Joi.date().iso().required(),
});

export const CreateMoldSchema = Joi.object({
  inventoryNumber: Joi.number().integer().positive().max(PG_INT_MAX).required(),
  name: Joi.string().required(),
  cavities: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  requiredClampingForceKN: Joi.number().positive().optional().allow(null),
  heightMM: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  widthMM: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  depthMM: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  centeringDiameterMM: Joi.number().positive().optional().allow(null),
  temperingTemperatures: Joi.array().items(temperingZoneSchema).optional().allow(null),
  weight: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  pictures: Joi.array().items(fileSchema).optional(),
  documents: Joi.array().items(fileSchema).optional(),
  status: Joi.string().valid("ok", "fault", "repair").optional().default("ok"),
  pieceCounter: Joi.number().integer().min(0).max(PG_INT_MAX).optional().default(0),
  serviceCategory: Joi.string().valid("S-1", "S-2", "S-3", "S-4").optional().allow(null),
  notes: Joi.string().optional().allow("", null),
  currentMachineId: Joi.string().uuid().optional().allow(null),
});

export const UpdateMoldSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  inventoryNumber: Joi.number().integer().positive().max(PG_INT_MAX).optional(),
  name: Joi.string().optional(),
  cavities: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  requiredClampingForceKN: Joi.number().positive().optional().allow(null),
  heightMM: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  widthMM: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  depthMM: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  centeringDiameterMM: Joi.number().positive().optional().allow(null),
  temperingTemperatures: Joi.array().items(temperingZoneSchema).optional().allow(null),
  weight: Joi.number().integer().positive().max(PG_INT_MAX).optional().allow(null),
  pictures: Joi.array().items(fileSchema).optional(),
  documents: Joi.array().items(fileSchema).optional(),
  status: Joi.string().valid("ok", "fault", "repair").optional(),
  pieceCounter: Joi.number().integer().min(0).max(PG_INT_MAX).optional(),
  serviceCategory: Joi.string().valid("S-1", "S-2", "S-3", "S-4").optional().allow(null),
  notes: Joi.string().optional().allow("", null),
  currentMachineId: Joi.string().uuid().optional().allow(null),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});