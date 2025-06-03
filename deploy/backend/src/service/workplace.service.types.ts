export type Workplace = {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type WorkplaceWithCategory = Workplace & {
  categoryName: string;
};

export type CreateWorkplaceData = Omit<
  Workplace,
  "id" | "createdAt" | "updatedAt"
>;

export type EditWorkplaceData = Omit<Workplace, "createdAt" | "updatedAt">;
