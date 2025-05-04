import { z } from 'zod';

export const loginSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee Number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const resetPasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, 'Old password must be at least 6 characters'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .extend({
    employeeNumber: z.string().optional(), // not validated in the form, only added before request
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
