import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { machineAvailabilityStatusSchema } from '@/zodValidationSchemas/machineAvailabilityStatus.schema.ts';

export type MachineAvailabilityStatus = z.infer<
  typeof machineAvailabilityStatusSchema
>;

export type AddMachineAvailabilityStatusFormData = Omit<
  MachineAvailabilityStatus,
  'id' | 'createdAt' | 'updatedAt'
>;

export type EditMachineAvailabilityStatusFormData = {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type MachineAvailabilityStatusSingleResponse = ApiResponse<{
  machineAvailabilityStatus: MachineAvailabilityStatus;
}>;

export type MachineAvailabilityStatusListResponse = ApiResponse<{
  statuses: MachineAvailabilityStatus[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type MachineAvailabilityStatusState = {
  currentStatus: MachineAvailabilityStatus | null;
  statuses: MachineAvailabilityStatus[];
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
