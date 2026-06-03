export type MaintenanceTemplateStep = {
  id: string;
  templateId: string;
  stepOrder: number;
  description: string;
  isRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MaintenanceTemplateStepInput = {
  stepOrder: number;
  description: string;
  isRequired: boolean;
};

export type MaintenanceTemplateCreatePayload = {
  name: string;
  targetType: string;
  intervalType: string;
  intervalValue: number | null;
  notes: string | null;
  steps: MaintenanceTemplateStepInput[];
};

export type MaintenanceTemplateUpdatePayload = MaintenanceTemplateCreatePayload & { id: string };

export type MaintenanceTemplate = {
  id: string;
  name: string;
  targetType: string;
  intervalType: string;
  intervalValue: number | null;
  notes: string | null;
  stepCount?: number;
  steps?: MaintenanceTemplateStep[];
  createdAt?: string;
  updatedAt?: string;
};

export type MaintenanceTemplateState = {
  items: MaintenanceTemplate[];
  current: MaintenanceTemplate | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchMaintenanceTemplateParams = {
  page: number;
  limit: number;
  search: string;
};

export type MaintenanceTemplateListResponse = {
  success: boolean;
  message: string;
  content: {
    items: MaintenanceTemplate[];
    pagination: { total: number; page: number; limit: number };
  };
};

export type MaintenanceTemplateSingleResponse = {
  success: boolean;
  message: string;
  content: {
    maintenanceTemplate: MaintenanceTemplate;
  };
};