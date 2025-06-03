export type WorkplaceCategory = {
  id: number;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateWorkplaceCategoryData = Omit<
  WorkplaceCategory,
  "id" | "createdAt" | "updatedAt"
>;

export type EditWorkplaceCategoryData = Omit<
  WorkplaceCategory,
  "createdAt" | "updatedAt"
>;
