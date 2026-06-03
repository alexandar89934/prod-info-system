export type MaintenanceTemplateStep = {
  id: string;
  templateId: string;
  stepOrder: number;
  description: string;
  isRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MaintenanceTemplate = {
  id: string;
  name: string;
  targetType: string;
  intervalType: string;
  intervalValue: number | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MaintenanceTemplateWithSteps = MaintenanceTemplate & {
  steps: MaintenanceTemplateStep[];
};

export type MaintenanceTemplateWithStepCount = MaintenanceTemplate & {
  stepCount: number;
};

export type CreateMaintenanceTemplateStepData = {
  stepOrder: number;
  description: string;
  isRequired: boolean;
};

export type CreateMaintenanceTemplateData = Omit<MaintenanceTemplate, "id" | "createdAt" | "updatedAt"> & {
  steps: CreateMaintenanceTemplateStepData[];
};

export type EditMaintenanceTemplateData = Omit<MaintenanceTemplate, "createdAt" | "updatedAt"> & {
  steps: CreateMaintenanceTemplateStepData[];
};