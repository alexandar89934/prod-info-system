import { z } from 'zod';

import { getName } from '@/state/auth/auth.selectors.ts';

export const personSchema = z
  .object({
    employeeNumber: z
      .number({ invalid_type_error: 'Employee number is required' })
      .min(1, 'Employee number must be at least 1'),
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    mail: z.string().email('Invalid email address'),
    additionalInfo: z.string().optional(),
    picture: z.string().optional(),
    documents: z.array(z.any()).optional().default([]),
    roles: z.array(z.any()).optional().default([]),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    createdBy: z.string().default(() => getName()),
    updatedBy: z.string().default(() => getName()),
  })
  .refine(
    (data) => {
      return !(
        data.endDate && new Date(data.endDate) <= new Date(data.startDate)
      );
    },
    {
      message: 'End date must be later than the start date.',
      path: ['endDate'],
    }
  );
