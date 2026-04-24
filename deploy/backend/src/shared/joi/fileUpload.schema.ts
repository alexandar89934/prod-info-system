import Joi from "joi";

export const FileSchema = Joi.object({
  name: Joi.string().required(),
  path: Joi.string().required(),
  dateAdded: Joi.date().iso().required(),
});

export const FilesArraySchema = Joi.array().items(FileSchema).required();
