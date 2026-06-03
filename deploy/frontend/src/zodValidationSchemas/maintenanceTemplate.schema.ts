import { z } from 'zod';

export const maintenanceTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  targetType: z.enum(['machine', 'equipment', 'mold', 'vehicle'], {
    required_error: 'Target type is required',
  }),
  intervalType: z.enum(['days', 'injections', 'on_demand'], {
    required_error: 'Interval type is required',
  }),
  intervalValue: z.number().int().min(1).nullable().optional(),
  notes: z.string().optional().nullable(),
  steps: z
    .array(
      z.object({
        stepOrder: z.number().int().min(1),
        description: z.string().min(1, 'Step description is required').max(500),
        isRequired: z.boolean(),
      })
    )
    .min(1, 'At least one step is required'),
});

export type MaintenanceTemplateFormData = z.infer<typeof maintenanceTemplateSchema>;