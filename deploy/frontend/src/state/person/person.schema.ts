import { z } from 'zod';

import { getName } from '@/state/auth/auth.selectors.ts';

export const addPersonSchema = z.object({
  employeeNumber: z
    .number({ invalid_type_error: 'Employee number is required' })
    .min(1, 'Employee number must be at least 1'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  mail: z.string().email('Invalid email address'),
  additionalInfo: z.string().min(1, 'Additional Info is required'),
  picture: z.string().optional(),
  documents: z.array(z.any()).optional().default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().default(() => getName()),
  updatedBy: z.string().default(() => getName()),
});
