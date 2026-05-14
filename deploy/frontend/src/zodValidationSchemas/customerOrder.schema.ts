import { z } from 'zod';

export const customerOrderLineSchema = z.object({
  itemId: z.string().uuid('Select an item'),
  quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).int().min(1, 'Min 1'),
});

export const customerOrderSchema = z.object({
  customerId: z.string().uuid('Select a customer'),
  deliveryDate: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  lines: z.array(customerOrderLineSchema).min(1, 'At least one item line is required'),
});

export type CustomerOrderFormData = z.infer<typeof customerOrderSchema>;
export type CustomerOrderLineFormData = z.infer<typeof customerOrderLineSchema>;