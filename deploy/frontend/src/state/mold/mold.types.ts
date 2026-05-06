import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { moldSchema } from '@/zodValidationSchemas/mold.schema.ts';

export type Mold = z.infer<typeof moldSchema> & {
  currentMachineName?: string | null;
  currentMachineNumber?: number | null;
  ownedByCompanyName?: string | null;
};

export type AddMoldFormData = Omit<Mold, 'id' | 'createdAt' | 'updatedAt'>;

export type EditMoldFormData = Mold & { id: string };

export type MoldSingleResponse = ApiResponse<{ mold: Mold }>;

export type MoldListResponse = ApiResponse<{
  molds: Mold[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type MoldState = {
  currentMold: EditMoldFormData | null;
  molds: Mold[];
  moldsByCompany: Mold[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchMoldParams = {
  page: number;
  limit: number;
  search: string;
  sortField?: string;
  sortOrder?: string;
};