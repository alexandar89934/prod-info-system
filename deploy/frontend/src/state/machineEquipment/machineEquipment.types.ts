import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { machineEquipmentSchema } from '@/zodValidationSchemas/machineEquipment.schema.ts';

export type MachineEquipment = z.infer<typeof machineEquipmentSchema>;

export type AddMachineEquipmentFormData = Omit<
  MachineEquipment,
  'id' | 'createdAt' | 'updatedAt'
>;

export type EditMachineEquipmentFormData = {
  id: number;
  name: string;
  model?: string | null;
  serialNumber: string;
  type: number;
  machineId?: string | null;
  equipmentTypeName?: string | null;
  machineName?: string | null;
  machineNumber?: number | null;
  description?: string | null;
  documents?: MachineEquipment['documents'];
  pictures?: MachineEquipment['pictures'];
  createdBy?: string;
  updatedBy?: string;
};

export type MachineEquipmentSingleResponse = ApiResponse<{
  machineEquipment: MachineEquipment;
}>;

export type MachineEquipmentListResponse = ApiResponse<{
  equipments: MachineEquipment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type MachineEquipmentState = {
  currentEquipment: EditMachineEquipmentFormData | null;
  equipments: MachineEquipment[];
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
