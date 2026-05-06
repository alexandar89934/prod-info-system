import { ApiResponse } from '@/state/defaultResponse';

export type PackagingUnitPicture = { name: string; path: string; dateAdded: string | Date };

export type PackagingUnit = {
  id: string;
  name: string;
  description: string | null;
  picture: PackagingUnitPicture | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PackagingUnitSingleResponse = ApiResponse<{ packagingUnit: PackagingUnit }>;
export type PackagingUnitListResponse = ApiResponse<{
  packagingUnits: PackagingUnit[];
  pagination: { total: number; page: number; limit: number };
}>;

export type FetchPackagingUnitParams = { page: number; limit: number; search: string };

export type PackagingUnitState = {
  packagingUnits: PackagingUnit[];
  currentPackagingUnit: PackagingUnit | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};