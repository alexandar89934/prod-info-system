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
  responsibilities: string[];
};

export type CreateJobPositionData = Omit<
  JobPosition,
  "id" | "createdAt" | "updatedAt"
> & {
  responsibilities?: string[];
};

export type EditJobPositionData = Omit<JobPosition, "createdAt" | "updatedAt"> & {
  responsibilities?: string[];
};