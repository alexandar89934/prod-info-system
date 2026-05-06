import { ApiResponse } from '@/state/defaultResponse.ts';

export type MoldMachineCompatibility = {
  id: string;
  moldId: string;
  machineId: string;
  machineName?: string;
  machineNumber?: number;
  cycleTimeSeconds: number | null;
  startupScrapCount: number | null;
  normPerShift: number | null;
  pieceWeightG: number | null;
  runnerWeightG: number | null;
  notes: string | null;
  settingParameters: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCompatibilityData = {
  moldId: string;
  machineId: string;
  cycleTimeSeconds?: number | null;
  startupScrapCount?: number | null;
  normPerShift?: number | null;
  pieceWeightG?: number | null;
  runnerWeightG?: number | null;
  notes?: string | null;
  settingParameters?: Record<string, unknown> | null;
};

export type UpdateCompatibilityData = {
  id: string;
  cycleTimeSeconds?: number | null;
  startupScrapCount?: number | null;
  normPerShift?: number | null;
  pieceWeightG?: number | null;
  runnerWeightG?: number | null;
  notes?: string | null;
  settingParameters?: Record<string, unknown> | null;
};

export type CompatibilityListResponse = ApiResponse<{ compatibilities: MoldMachineCompatibility[] }>;
export type CompatibilitySingleResponse = ApiResponse<{ compatibility: MoldMachineCompatibility }>;

export type MoldMachineCompatibilityState = {
  compatibilities: MoldMachineCompatibility[];
  loading: boolean;
  error: string | null;
  success: string | null;
};