export type JobPositionCategory = {
  id: number;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateJobPositionCategoryData = Omit<
  JobPositionCategory,
  "id" | "createdAt" | "updatedAt"
>;

export type EditJobPositionCategoryData = Omit<
  JobPositionCategory,
  "createdAt" | "updatedAt"
>;