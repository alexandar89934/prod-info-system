import { FileReference } from "./machine.service.types";

export type { FileReference };

export type TemperingZone = {
  zone: string;
  minTemp: number;
  maxTemp: number;
};

export type Mold = {
  id: string;
  inventoryNumber: number;
  name: string;
  cavities: number | null;
  requiredClampingForceKN: number | null;
  heightMM: number | null;
  widthMM: number | null;
  depthMM: number | null;
  centeringDiameterMM: number | null;
  temperingTemperatures: TemperingZone[] | null;
  weight: number | null;
  pictures: FileReference[] | null;
  documents: FileReference[] | null;
  status: "ok" | "fault" | "repair";
  pieceCounter: number;
  serviceCategory: "S-1" | "S-2" | "S-3" | "S-4" | null;
  notes: string | null;
  currentMachineId: string | null;
  currentMachineName?: string | null;
  currentMachineNumber?: number | null;
  ownedByCompanyId: string | null;
  ownedByCompanyName?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateMoldData = Omit<Mold, "id" | "createdAt" | "updatedAt">;
export type EditMoldData = Omit<Mold, "createdAt" | "updatedAt">;