import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { machineEquipmentTypeSchema } from '@/zodValidationSchemas/machineEquipmentType.schema.ts';

export type MachineEquipmentType = z.infer<typeof machineEquipmentTypeSchema>;

export type AddMachineEquipmentTypeFormData = Omit<
  MachineEquipmentType,
  'id' | 'createdAt' | 'updatedAt'
>;

export type EditMachineEquipmentTypeFormData = {
  id: number;
  name: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type MachineEquipmentTypeSingleResponse = ApiResponse<{
  machineEquipmentType: MachineEquipmentType;
}>;

export type MachineEquipmentTypeListResponse = ApiResponse<{
  equipmentTypes: MachineEquipmentType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type MachineEquipmentTypeState = {
  currentType: MachineEquipmentType | null;
  equipmentTypes: MachineEquipmentType[];
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
