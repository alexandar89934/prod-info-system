import { z } from 'zod';

export const createResponsibilitySchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(100)
    .regex(/^[a-z0-9_]+$/, 'Code must contain only lowercase letters, digits, and underscores'),
  label: z.string().min(1, 'Label is required').max(200),
  description: z.string().optional().nullable(),
});

export const editResponsibilitySchema = z.object({
  id: z.number(),
  label: z.string().min(1, 'Label is required').max(200),
  description: z.string().optional().nullable(),
});

export const responsibilitySchema = createResponsibilitySchema;