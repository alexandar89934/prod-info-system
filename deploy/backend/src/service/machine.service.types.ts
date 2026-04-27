export type FileReference = {
  name: string;
  path: string;
  dateAdded: string;
};

export type AttachedEquipment = {
  id: number;
  name: string;
  model: string | null;
  serialNumber: string | null;
  equipmentTypeName: string | null;
};

export type Machine = {
  id: string;
  name: string;
  attachedEquipment?: AttachedEquipment[];
  machineNumber: number;
  serialNumber: string | null;
  yearOfManufacture: number | null;
  clampingForce: number | null;
  injectionWeight: string | null;
  description: string | null;
  pictures: FileReference[] | null;
  documents: FileReference[] | null;
  maxMoldWeight: number | null;
  maxMoldWidth: number | null;
  maxMoldHeight: number | null;
  minMoldThickness: number | null;
  maxMoldThickness: number | null;
  centeringRingFixedSide: string | null;
  centeringRingMovingSide: string | null;
  controlSystem: string | null;
  serviceInterval: number | null;
  lastServiceDone: string | null;
  automaticMode: boolean;
  semiAutomaticMode: boolean;
  manualMode: boolean;
  workHoursCounter: number;
  pieceCounter: number;
  scrapCounter: number;
  workPermit: boolean;
  availabilityStatusId: number | null;
  availabilityStatusName?: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateMachineData = Omit<
  Machine,
  "id" | "createdAt" | "updatedAt" | "availabilityStatusName"
>;

export type EditMachineData = Omit<
  Machine,
  "createdAt" | "updatedAt" | "availabilityStatusName"
>;