import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { machineSchema } from '@/zodValidationSchemas/machine.schema.ts';

export type AttachedEquipment = {
  id: number;
  name: string;
  model: string | null;
  serialNumber: string | null;
  equipmentTypeName: string | null;
};

export type Machine = z.infer<typeof machineSchema> & {
  attachedEquipment?: AttachedEquipment[];
};

export type AddMachineFormData = Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>;

export type EditMachineFormData = Machine & {
  id: string;
  availabilityStatusName?: string | null;
};

export type MachineSingleResponse = ApiResponse<{ machine: Machine }>;

export type MachineListResponse = ApiResponse<{
  machines: Machine[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}>;

export type MachineState = {
  currentMachine: EditMachineFormData | null;
  machines: Machine[];
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