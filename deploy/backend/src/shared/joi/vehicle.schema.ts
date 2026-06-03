import Joi from "joi";

const currentYear = new Date().getFullYear();

const vehicleBody = {
  name:              Joi.string().max(255).required(),
  type:              Joi.string().valid('car', 'forklift', 'truck', 'other').required(),
  licensePlate:      Joi.string().max(50).allow(null, '').optional(),
  model:             Joi.string().max(255).allow(null, '').optional(),
  yearOfManufacture: Joi.number().integer().min(1900).max(currentYear + 1).allow(null).optional(),
  notes:             Joi.string().allow(null, '').optional(),
};

export const CreateVehicleSchema = Joi.object(vehicleBody);
export const UpdateVehicleSchema = Joi.object(vehicleBody);