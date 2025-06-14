import { z } from 'zod';

export const workplaceSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  categoryId: z.number().int().min(1, 'Category is required'),
});
