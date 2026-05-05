import { z } from 'zod';

import { ApiResponse } from '@/state/defaultResponse.ts';
import { bomLineSchema, itemSchema } from '@/zodValidationSchemas/item.schema.ts';

export type Item = z.infer<typeof itemSchema> & {
  toolName?: string | null;
  toolInventoryNumber?: number | null;
};

export type BomLine = z.infer<typeof bomLineSchema> & {
  inputItemCode?: string;
  inputItemName?: string;
  inputItemUnit?: string;
};

export type AddItemFormData = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'toolName' | 'toolInventoryNumber'>;
export type EditItemFormData = Item & { id: string };

export type ItemSingleResponse = ApiResponse<{ item: Item }>;
export type ItemListResponse = ApiResponse<{
  items: Item[];
  pagination: { total: number; page: number; limit: number };
}>;

export type BomLineSingleResponse = ApiResponse<{ bomLine: BomLine }>;
export type BomLineListResponse = ApiResponse<{ bomLines: BomLine[] }>;

export type ItemState = {
  currentItem: EditItemFormData | null;
  items: Item[];
  bomLines: BomLine[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchItemParams = {
  page: number;
  limit: number;
  search: string;
  sortField?: string;
  sortOrder?: string;
};