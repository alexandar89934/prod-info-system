import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { workplaceSchema } from '@/zodValidationSchemas/workplace.schema.ts';

export type Workplace = z.infer<typeof workplaceSchema>;

export type AddWorkplaceFormData = Omit<Workplace, 'id'>;

export type EditWorkplaceFormData = Partial<
  Omit<Workplace, 'createdAt' | 'updatedAt'>
> & {
  id: number;
};

export type WorkplaceSingleResponse = ApiResponse<{ workplace: Workplace }>;

export type WorkplaceListResponse = ApiResponse<{
  workplaces: Workplace[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type FetchWorkplacesParams = {
  page: number;
  limit: number;
  search: string;
  sortField?: string;
  sortOrder?: string;
};

export type WorkplaceState = {
  currentWorkplace: Workplace | null;
  workplaces: Workplace[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};
