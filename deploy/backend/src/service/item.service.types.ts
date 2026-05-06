import { FileReference } from "./machine.service.types";

export type { FileReference };
export type ItemCategory = "raw_material" | "masterbatch" | "component" | "semi_finished" | "finished_good" | "regrind" | "packaging";
export type ItemUnit = "g" | "kg" | "kom" | "m" | "m2";
export type ItemApprovalLevel = "qc_controller" | "shift_manager";

export type Item = {
  id: string;
  itemCode: string;
  name: string;
  category: ItemCategory;
  unit: ItemUnit;
  priceEurPerUnit: number | null;
  approvalLevel: ItemApprovalLevel | null;
  toolId: string | null;
  toolName?: string | null;
  toolInventoryNumber?: number | null;
  pictures: FileReference[] | null;
  documents: FileReference[] | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateItemData = Omit<Item, "id" | "createdAt" | "updatedAt" | "toolName" | "toolInventoryNumber">;
export type EditItemData = Omit<Item, "createdAt" | "updatedAt" | "toolName" | "toolInventoryNumber">;