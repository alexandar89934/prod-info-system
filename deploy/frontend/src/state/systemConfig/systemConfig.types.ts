export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemConfigState {
  configs: SystemConfig[];
  loading: boolean;
  updateLoading: boolean;
  error: string | null;
  success: string | null;
}
