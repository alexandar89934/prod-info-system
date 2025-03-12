import { z } from 'zod';

export const loginSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee Number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
