export type SystemConfig = {
  id: number;
  key: string;
  value: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UpdateSystemConfigData = {
  key: string;
  value: string;
};