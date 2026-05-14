import Joi from "joi";

export const CreateCustomerOrderSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  deliveryDate: Joi.string().isoDate().allow(null, "").optional(),
  notes: Joi.string().max(2000).allow(null, "").optional(),
  lines: Joi.array().items(
    Joi.object({
      itemId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});

export const UpdateCustomerOrderSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  deliveryDate: Joi.string().isoDate().allow(null, "").optional(),
  notes: Joi.string().max(2000).allow(null, "").optional(),
  status: Joi.string().valid("open", "in_plan", "fulfilled").required(),
});

export const AddOrderLineSchema = Joi.object({
  itemId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
});