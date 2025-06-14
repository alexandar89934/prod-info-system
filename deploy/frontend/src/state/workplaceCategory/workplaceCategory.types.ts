import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { workplaceCategorySchema } from '@/zodValidationSchemas/workplaceCategory.schema.ts';

export type WorkplaceCategory = z.infer<typeof workplaceCategorySchema>;

export type AddWorkplaceCategoryFormData = Omit<
  WorkplaceCategory,
  'id' | 'createdAt' | 'updatedAt'
>;

export type EditWorkplaceCategoryFormData = {
  id: number;
  name: string;
  description?: string;
};

export type WorkplaceCategorySingleResponse = ApiResponse<{
  workplaceCategory: WorkplaceCategory;
}>;

export type WorkplaceCategoryListResponse = ApiResponse<{
  categories: WorkplaceCategory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type WorkplaceCategoryState = {
  currentCategory: WorkplaceCategory | null;
  categories: WorkplaceCategory[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchParams = {
  page: number;
  limit: number;
  search: string;
  sortField?: string;
  sortOrder?: string;
};
