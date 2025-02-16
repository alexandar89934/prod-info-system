import Joi from "joi";

export const CreatePersonSchema = Joi.object({
  employeeNumber: Joi.number().integer().required(),
  name: Joi.string().required(),
  address: Joi.string().required(),
  mail: Joi.string().email().required(),
  picture: Joi.string().optional(),
  profileImage: Joi.string().optional(),
  additionalInfo: Joi.string().optional(),
  documents: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        path: Joi.string().required(),
        dateAdded: Joi.date().required(),
      }),
    )
    .optional(),
  createdAt: Joi.date().iso().required(),
  updatedAt: Joi.date().iso().required(),
  createdBy: Joi.string().required(),
  updatedBy: Joi.string().required(),
});

export const UpdatePersonSchema = Joi.object({
  id: Joi.string().uuid().empty(""),
  employeeNumber: Joi.number().integer().empty(""),
  name: Joi.string().empty(""),
  address: Joi.string().empty(""),
  mail: Joi.string().email().empty(""),
  picture: Joi.string().empty(""),
  additionalInfo: Joi.string().empty(""),
  documents: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        path: Joi.string().required(),
        dateAdded: Joi.date().required(),
      }),
    )
    .optional(),
  createdAt: Joi.date().empty(""),
  updatedAt: Joi.date().empty(""),
  createdBy: Joi.string().required(),
  updatedBy: Joi.string().required(),
});
