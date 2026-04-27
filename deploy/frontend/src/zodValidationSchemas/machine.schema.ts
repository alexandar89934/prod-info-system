import { z } from 'zod';

const fileSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  dateAdded: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !Number.isNaN(date.getTime()), { message: 'Invalid date format' }),
});

const PG_INT_MAX = 2147483647;
const INT_MAX_KEY = 'machine.validation.intMax';

export const machineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'machine.validation.nameRequired'),
  machineNumber: z.coerce
    .number()
    .int()
    .positive('machine.validation.machineNumberPositive')
    .max(PG_INT_MAX, INT_MAX_KEY),
  serialNumber: z.string().optional().nullable(),
  yearOfManufacture: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  clampingForce: z.coerce.number().int().positive().max(PG_INT_MAX, INT_MAX_KEY).optional().nullable(),
  injectionWeight: z.string().optional().nullable(),
  controlSystem: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  pictures: z.array(fileSchema).optional().default([]),
  documents: z.array(fileSchema).optional().default([]),
  maxMoldWeight: z.coerce.number().int().max(PG_INT_MAX, INT_MAX_KEY).optional().nullable(),
  maxMoldWidth: z.coerce.number().int().max(PG_INT_MAX, INT_MAX_KEY).optional().nullable(),
  maxMoldHeight: z.coerce.number().int().max(PG_INT_MAX, INT_MAX_KEY).optional().nullable(),
  minMoldThickness: z.coerce.number().int().positive().max(PG_INT_MAX, INT_MAX_KEY).optional().nullable(),
  maxMoldThickness: z.coerce.number().int().positive().max(PG_INT_MAX, INT_MAX_KEY).optional().nullable(),
  centeringRingFixedSide: z.string().optional().nullable(),
  centeringRingMovingSide: z.string().optional().nullable(),
  serviceInterval: z.coerce.number().int().max(PG_INT_MAX, INT_MAX_KEY).optional().nullable(),
  lastServiceDone: z.string().optional().nullable(),
  automaticMode: z.boolean().optional().default(false),
  semiAutomaticMode: z.boolean().optional().default(false),
  manualMode: z.boolean().optional().default(false),
  workHoursCounter: z.coerce.number().int().max(PG_INT_MAX, INT_MAX_KEY).optional().default(0),
  pieceCounter: z.coerce.number().int().max(PG_INT_MAX, INT_MAX_KEY).optional().default(0),
  scrapCounter: z.coerce.number().int().max(PG_INT_MAX, INT_MAX_KEY).optional().default(0),
  workPermit: z.boolean().optional().default(false),
  availabilityStatusId: z.coerce.number().int().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  updatedBy: z.string().optional().nullable(),
});