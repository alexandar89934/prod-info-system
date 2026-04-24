import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { jobPositionSchema } from '@/zodValidationSchemas/jobPosition.schema.ts';

export type JobPosition = z.infer<typeof jobPositionSchema>;

export type AddJobPositionFormData = Omit<JobPosition, 'id'>;

export type EditJobPositionFormData = Partial<
  Omit<JobPosition, 'createdAt' | 'updatedAt'>
> & {
  id: number;
};

export type JobPositionSingleResponse = ApiResponse<{ jobPosition: JobPosition }>;

export type JobPositionListResponse = ApiResponse<{
  jobPositions: JobPosition[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type FetchJobPositionsParams = {
  page: number;
  limit: number;
  search: string;
  sortField?: string;
  sortOrder?: string;
};

export type JobPositionState = {
  currentJobPosition: JobPosition | null;
  jobPositions: JobPosition[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};