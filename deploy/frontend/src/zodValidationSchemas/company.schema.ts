import { z } from 'zod';

export const companyEmailSchema = z.object({
  address: z.string().email('Invalid email address'),
  isPrimary: z.boolean(),
});

export const companySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  pib: z.string().min(1, 'PIB is required').max(20),
  mb: z.string().min(1, 'MB is required').max(20),
  address: z.string().max(255).optional().nullable(),
  phones: z.array(z.string()).default([]),
  emails: z.array(companyEmailSchema).default([]),
  ownerInfo: z.string().max(255).optional().nullable(),
  representative: z.string().max(255).optional().nullable(),
  isOwnCompany: z.boolean().default(false),
  isCustomer: z.boolean().default(false),
  isSupplier: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export type CompanyFormData = z.infer<typeof companySchema>;