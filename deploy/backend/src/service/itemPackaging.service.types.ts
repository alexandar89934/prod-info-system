import { FileReference } from "./machine.service.types";

export type ItemPackaging = {
  id: string;
  itemId: string;
  packagingUnitId: string;
  quantityPerUnit: number;
  pictures: FileReference[];
  notes: string | null;
  packagingUnitName?: string;
  packagingUnitDescription?: string | null;
  packagingUnitPicture?: FileReference | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateItemPackagingData = Omit<ItemPackaging, "id" | "createdAt" | "updatedAt" | "packagingUnitName" | "packagingUnitDescription" | "packagingUnitPicture">;
export type EditItemPackagingData = Omit<ItemPackaging, "createdAt" | "updatedAt" | "packagingUnitName" | "packagingUnitDescription" | "packagingUnitPicture">;