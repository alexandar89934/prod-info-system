import { z } from 'zod';

const fileSchema = z.object({
  name: z.string(),
  path: z.string(),
  dateAdded: z.string().or(z.date()).transform((v) => new Date(v)),
});

export const packagingUnitSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional().nullable(),
  picture: fileSchema.optional().nullable(),
});

export type PackagingUnitFormData = z.infer<typeof packagingUnitSchema>;