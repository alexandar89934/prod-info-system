import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { jobPositionCategorySchema } from '@/zodValidationSchemas/jobPositionCategory.schema.ts';

export type JobPositionCategory = z.infer<typeof jobPositionCategorySchema>;

export type AddJobPositionCategoryFormData = Omit<
  JobPositionCategory,
  'id' | 'createdAt' | 'updatedAt'
>;

export type EditJobPositionCategoryFormData = {
  id: number;
  name: string;
  description?: string;
};

export type JobPositionCategorySingleResponse = ApiResponse<{
  jobPositionCategory: JobPositionCategory;
}>;

export type JobPositionCategoryListResponse = ApiResponse<{
  categories: JobPositionCategory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type JobPositionCategoryState = {
  currentCategory: JobPositionCategory | null;
  categories: JobPositionCategory[];
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