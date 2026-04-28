import { ApiResponse } from '@/state/defaultResponse.ts';

export interface Responsibility {
  id: number;
  code: string;
  label: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AddResponsibilityFormData = {
  code: string;
  label: string;
  description?: string | null;
};

export type EditResponsibilityFormData = {
  id: number;
  label: string;
  description?: string | null;
};

export type ResponsibilitySingleResponse = ApiResponse<{
  responsibility: Responsibility;
}>;

export type ResponsibilityListResponse = ApiResponse<{
  responsibilities: Responsibility[];
}>;

export type ResponsibilityState = {
  responsibilities: Responsibility[];
  currentResponsibility: Responsibility | null;
  loading: boolean;
  error: string | null;
  success: string | null;
};