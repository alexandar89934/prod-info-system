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

export type CreateMaintenanceAssignmentsData = {
  templateId: string;
  targetType: TargetType;
  targetIds: string[];
};