export type TargetType = 'machine' | 'equipment' | 'mold' | 'vehicle';

export type MaintenanceAssignment = {
  id: string;
  templateId: string;
  templateName?: string;
  targetType: TargetType;
  targetId: string;
  targetName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TargetOption = {
  id: string;
  name: string;
};

export type MaintenanceAssignmentState = {
  items: MaintenanceAssignment[];
  availableTargets: TargetOption[];
  loading: boolean;
  targetsLoading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchMaintenanceAssignmentParams = {
  page: number;
  limit: number;
  search: string;
};

export type CreateMaintenanceAssignmentsPayload = {
  templateId: string;
  targetType: TargetType;
  targetIds: string[];
};

export type MaintenanceAssignmentListResponse = {
  success: boolean;
  message: string;
  content: {
    items: MaintenanceAssignment[];
    pagination: { total: number; page: number; limit: number };
  };
};

export type AvailableTargetsResponse = {
  success: boolean;
  message: string;
  content: { targets: TargetOption[] };
};