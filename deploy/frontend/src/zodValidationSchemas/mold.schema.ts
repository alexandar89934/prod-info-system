import { z } from 'zod';

const PG_INT_MAX = 2147483647;

const temperingZoneSchema = z.object({
  zone: z.string().min(1, 'mold.validation.zoneRequired'),
  minTemp: z.coerce.number({ invalid_type_error: 'mold.validation.tempRequired' }),
  maxTemp: z.coerce.number({ invalid_type_error: 'mold.validation.tempRequired' }),
});

const fileSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  dateAdded: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !Number.isNaN(date.getTime()), { message: 'Invalid date format' }),
});

export const moldSchema = z.object({
  id: z.string().optional(),
  inventoryNumber: z.coerce
    .number()
    .int()
    .positive('mold.validation.inventoryNumberPositive')
    .max(PG_INT_MAX, 'mold.validation.intMax'),
  name: z.string().min(1, 'mold.validation.nameRequired'),
  cavities: z.coerce.number().int().positive().max(PG_INT_MAX).optional().nullable(),
  requiredClampingForceKN: z.coerce.number().positive().optional().nullable(),
  heightMM: z.coerce.number().int().positive().max(PG_INT_MAX).optional().nullable(),
  widthMM: z.coerce.number().int().positive().max(PG_INT_MAX).optional().nullable(),
  depthMM: z.coerce.number().int().positive().max(PG_INT_MAX).optional().nullable(),
  centeringDiameterMM: z.coerce.number().positive().optional().nullable(),
  temperingTemperatures: z.array(temperingZoneSchema).optional().default([]),
  weight: z.coerce.number().int().positive().max(PG_INT_MAX).optional().nullable(),
  pictures: z.array(fileSchema).optional().default([]),
  documents: z.array(fileSchema).optional().default([]),
  status: z.enum(['ok', 'fault', 'repair']).default('ok'),
  pieceCounter: z.coerce.number().int().min(0).max(PG_INT_MAX).optional().default(0),
  serviceCategory: z.enum(['S-1', 'S-2', 'S-3', 'S-4']).optional().nullable(),
  notes: z.string().optional().nullable(),
  currentMachineId: z.string().uuid().optional().nullable(),
  ownedByCompanyId: z.string().uuid().optional().nullable(),
});

export type MoldSchemaType = z.infer<typeof moldSchema>;
export type TemperingZoneType = z.infer<typeof temperingZoneSchema>;