import { z } from 'zod';

export const ITEM_CATEGORIES = ['raw_material', 'masterbatch', 'component', 'semi_finished', 'finished_good', 'regrind', 'packaging'] as const;
export const ITEM_UNITS = ['g', 'kg', 'kom', 'm', 'm2'] as const;
export const ITEM_APPROVAL_LEVELS = ['qc_controller', 'shift_manager'] as const;

const fileSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  dateAdded: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !Number.isNaN(date.getTime()), { message: 'Invalid date format' }),
});

export const itemSchema = z.object({
  id: z.string().optional(),
  itemCode: z.string().min(1, 'item.validation.itemCodeRequired').max(20, 'item.validation.itemCodeMax'),
  name: z.string().min(1, 'item.validation.nameRequired'),
  category: z.enum(ITEM_CATEGORIES, { errorMap: () => ({ message: 'item.validation.categoryRequired' }) }),
  unit: z.enum(ITEM_UNITS, { errorMap: () => ({ message: 'item.validation.unitRequired' }) }),
  priceEurPerUnit: z.coerce.number().positive().optional().nullable(),
  approvalLevel: z.enum(ITEM_APPROVAL_LEVELS).optional().nullable(),
  toolId: z.string().uuid().optional().nullable(),
  pictures: z.array(fileSchema).optional().default([]),
  documents: z.array(fileSchema).optional().default([]),
  notes: z.string().optional().nullable(),
});

export const bomLineSchema = z.object({
  id: z.string().optional(),
  outputItemId: z.string().uuid(),
  inputItemId: z.string().uuid({ message: 'item.validation.inputItemRequired' }),
  quantityPerPiece: z.coerce.number().positive('item.validation.quantityPositive'),
  unit: z.enum(ITEM_UNITS, { errorMap: () => ({ message: 'item.validation.unitRequired' }) }),
  notes: z.string().optional().nullable(),
});

export type ItemSchemaType = z.infer<typeof itemSchema>;
export type BomLineSchemaType = z.infer<typeof bomLineSchema>;