export type MachineAvailabilityStatus = {
  id: number;
  name: string;
  description: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateMachineAvailabilityStatusData = Omit<
  MachineAvailabilityStatus,
  "id" | "createdAt" | "updatedAt"
>;

export type EditMachineAvailabilityStatusData = Omit<
  MachineAvailabilityStatus,
  "createdAt" | "updatedAt"
>;
