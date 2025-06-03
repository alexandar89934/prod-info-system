import { z } from 'zod';

export const workplaceCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
});
