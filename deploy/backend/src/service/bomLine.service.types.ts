import { ItemUnit } from "./item.service.types";

export type BomLine = {
  id: string;
  outputItemId: string;
  inputItemId: string;
  quantityPerPiece: number;
  unit: ItemUnit;
  notes: string | null;
  inputItemCode?: string;
  inputItemName?: string;
  inputItemUnit?: ItemUnit;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateBomLineData = {
  outputItemId: string;
  inputItemId: string;
  quantityPerPiece: number;
  unit: ItemUnit;
  notes?: string | null;
};

export type EditBomLineData = CreateBomLineData & { id: string };