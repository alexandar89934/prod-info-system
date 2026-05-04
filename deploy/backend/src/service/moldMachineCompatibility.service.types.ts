export type MoldMachineCompatibility = {
  id: string;
  moldId: string;
  machineId: string;
  machineName?: string;
  machineNumber?: number;
  cycleTimeSeconds: number | null;
  startupScrapCount: number | null;
  notes: string | null;
  settingParameters: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateMoldMachineCompatibilityData = {
  moldId: string;
  machineId: string;
  cycleTimeSeconds?: number | null;
  startupScrapCount?: number | null;
  notes?: string | null;
  settingParameters?: Record<string, unknown> | null;
};

export type UpdateMoldMachineCompatibilityData = {
  id: string;
  cycleTimeSeconds?: number | null;
  startupScrapCount?: number | null;
  notes?: string | null;
  settingParameters?: Record<string, unknown> | null;
};