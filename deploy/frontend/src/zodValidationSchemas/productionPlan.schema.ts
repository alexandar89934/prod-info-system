import { z } from 'zod';

export const productionPlanSchema = z.object({
  customerOrderLineId: z.string().uuid().nullable().optional(),
  itemId: z.string().uuid('Select an item'),
  machineId: z.string().uuid('Select a machine'),
  moldId: z.string().uuid().nullable().optional(),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).int().min(1, 'Min 1'),
  expectedStartDate: z.string().nullable().optional(),
  expectedEndDate: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  shift1: z.boolean().optional().default(true),
  shift2: z.boolean().optional().default(true),
  shift3: z.boolean().optional().default(true),
});

export const updateProductionPlanSchema = productionPlanSchema.extend({
  status: z.enum(['queued', 'in_progress', 'done', 'cancelled']),
});

export type ProductionPlanFormData = z.infer<typeof productionPlanSchema>;
export type UpdateProductionPlanFormData = z.infer<typeof updateProductionPlanSchema>;