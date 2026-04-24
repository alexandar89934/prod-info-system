import Joi from "joi";

export const CreateMachineEquipmentSchema = Joi.object({
  name: Joi.string().required(),
  model: Joi.string().optional().allow(""),
  serialNumber: Joi.string().optional().allow(""),
  type: Joi.number().integer().required(), // FK to MachineEquipmentTypes
  description: Joi.string().optional().allow(""),
  documents: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        path: Joi.string().required(),
        dateAdded: Joi.date().iso().required(),
      }),
    )
    .optional(),
  pictures: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        path: Joi.string().required(),
        dateAdded: Joi.date().iso().required(),
      }),
    )
    .optional(),
  createdBy: Joi.string().optional().allow(""),
  updatedBy: Joi.string().optional().allow(""),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});

export const UpdateMachineEquipmentSchema = Joi.object({
  id: Joi.number().integer().required(),
  name: Joi.string().optional().allow(""),
  model: Joi.string().optional().allow(""),
  serialNumber: Joi.string().optional().allow(""),
  type: Joi.number().integer().optional(),
  description: Joi.string().optional().allow(""),
  documents: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        path: Joi.string().required(),
        dateAdded: Joi.date().iso().required(),
      }),
    )
    .optional(),
  pictures: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        path: Joi.string().required(),
        dateAdded: Joi.date().iso().required(),
      }),
    )
    .optional(),
  createdBy: Joi.string().optional().allow(""),
  updatedBy: Joi.string().optional().allow(""),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});
