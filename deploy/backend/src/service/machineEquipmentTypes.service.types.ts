export type MachineEquipmentType = {
  id: number;
  name: string;
  description: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateMachineEquipmentTypeData = Omit<
  MachineEquipmentType,
  "id" | "createdAt" | "updatedAt"
>;

export type EditMachineEquipmentTypeData = Omit<
  MachineEquipmentType,
  "createdAt" | "updatedAt"
>;
