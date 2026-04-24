export type JobPosition = {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type JobPositionWithCategory = JobPosition & {
  categoryName: string;
};

export type CreateJobPositionData = Omit<
  JobPosition,
  "id" | "createdAt" | "updatedAt"
>;

export type EditJobPositionData = Omit<JobPosition, "createdAt" | "updatedAt">;