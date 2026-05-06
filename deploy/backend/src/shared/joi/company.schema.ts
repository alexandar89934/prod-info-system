import Joi from "joi";

const emailEntrySchema = Joi.object({
  address: Joi.string().email({ tlds: { allow: false } }).required(),
  isPrimary: Joi.boolean().required(),
});

export const CreateCompanySchema = Joi.object({
  name: Joi.string().max(255).required(),
  pib: Joi.string().max(20).required(),
  mb: Joi.string().max(20).required(),
  address: Joi.string().max(255).optional().allow("", null),
  phones: Joi.array().items(Joi.string()).optional().default([]),
  emails: Joi.array().items(emailEntrySchema).optional().default([]),
  ownerInfo: Joi.string().max(255).optional().allow("", null),
  representative: Joi.string().max(255).optional().allow("", null),
  isOwnCompany: Joi.boolean().optional().default(false),
  isCustomer: Joi.boolean().optional().default(false),
  isSupplier: Joi.boolean().optional().default(false),
  notes: Joi.string().optional().allow("", null),
  logo: Joi.string().optional().allow("", null),
});

export const UpdateCompanySchema = Joi.object({
  name: Joi.string().max(255).optional(),
  pib: Joi.string().max(20).optional(),
  mb: Joi.string().max(20).optional(),
  address: Joi.string().max(255).optional().allow("", null),
  phones: Joi.array().items(Joi.string()).optional(),
  emails: Joi.array().items(emailEntrySchema).optional(),
  ownerInfo: Joi.string().max(255).optional().allow("", null),
  representative: Joi.string().max(255).optional().allow("", null),
  isOwnCompany: Joi.boolean().optional(),
  isCustomer: Joi.boolean().optional(),
  isSupplier: Joi.boolean().optional(),
  notes: Joi.string().optional().allow("", null),
  logo: Joi.string().optional().allow("", null),
});