import { z } from 'zod';

const fileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  path: z.string().min(1, 'File path is required'),
  dateAdded: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !Number.isNaN(date.getTime()), {
      message: 'Invalid date format',
    }),
});

export const machineEquipmentSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  model: z.string().optional().nullable(),
  serialNumber: z.string().min(1, 'Serial number is required'),
  type: z.coerce.number().min(1, 'Equipment type is required'),
  description: z.string().optional().nullable(),
  documents: z.array(fileSchema).optional().default([]),
  pictures: z.array(fileSchema).optional().default([]),
  createdBy: z.string().optional().nullable(),
  updatedBy: z.string().optional().nullable(),
});
