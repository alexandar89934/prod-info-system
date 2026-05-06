import { FileReference } from "./machine.service.types";

export type { FileReference };

export type PackagingUnit = {
  id: string;
  name: string;
  description: string | null;
  picture: FileReference | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreatePackagingUnitData = Omit<PackagingUnit, "id" | "createdAt" | "updatedAt">;
export type EditPackagingUnitData = Omit<PackagingUnit, "createdAt" | "updatedAt">;