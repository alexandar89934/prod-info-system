export interface Responsibility {
  id: number;
  code: string;
  label: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResponsibilityData {
  code: string;
  label: string;
  description?: string | null;
}

export interface EditResponsibilityData {
  id: number;
  label: string;
  description?: string | null;
}