import { z } from 'zod';

export type ErrorResponse = {
  code: number;
  message: string;
  removeUser?: boolean;
};

export type DefaultResponse = {
  success: boolean;
  message?: string;
  error?: ErrorResponse;
  content?: never;
};

export const loginSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee Number is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
