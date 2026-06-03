import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  name:              z.string().min(1, 'Name is required').max(255),
  type:              z.enum(['car', 'forklift', 'truck', 'other'], { required_error: 'Type is required' }),
  licensePlate:      z.string().max(50).nullable().optional(),
  model:             z.string().max(255).nullable().optional(),
  yearOfManufacture: z.number().int().min(1900).max(currentYear + 1).nullable().optional(),
  notes:             z.string().nullable().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;