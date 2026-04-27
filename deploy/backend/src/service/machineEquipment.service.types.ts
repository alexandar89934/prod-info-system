export type FileReference = {
  name: string;
  path: string;
  dateAdded: string;
};

export type MachineEquipment = {
  id: number;
  name: string;
  model: string | null;
  serialNumber: string | null;
  type: number;
  machineId: string | null;
  equipmentTypeName?: string | null;
  machineName?: string | null;
  machineNumber?: number | null;
  description: string | null;
  documents: FileReference[] | null;
  pictures: FileReference[] | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateMachineEquipmentData = Omit<
  MachineEquipment,
  "id" | "createdAt" | "updatedAt"
>;

export type EditMachineEquipmentData = Omit<
  MachineEquipment,
  "createdAt" | "updatedAt"
>;
