import { z } from 'zod';
import { ApiResponse } from '@/state/defaultResponse.ts';
import { customerOrderSchema } from '@/zodValidationSchemas/customerOrder.schema.ts';

export type CustomerOrderStatus = 'open' | 'in_plan' | 'fulfilled';

export type CustomerOrderLine = {
  id: string;
  customerOrderId: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrder = Omit<z.infer<typeof customerOrderSchema>, 'lines'> & {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  customerName?: string;
  lines?: CustomerOrderLine[];
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerOrderFormData = z.infer<typeof customerOrderSchema>;
export type UpdateCustomerOrderFormData = CreateCustomerOrderFormData & {
  id: string;
  status: CustomerOrderStatus;
};

export type AddOrderLineData = {
  customerOrderId: string;
  itemId: string;
  quantity: number;
};

export type CustomerOrderSingleResponse = ApiResponse<{ customerOrder: CustomerOrder }>;
export type CustomerOrderLineResponse = ApiResponse<{ line: CustomerOrderLine }>;
export type CustomerOrderListResponse = ApiResponse<{
  customerOrders: CustomerOrder[];
  pagination: { total: number; page: number; limit: number };
}>;

export type CustomerOrderState = {
  currentOrder: CustomerOrder | null;
  orders: CustomerOrder[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchCustomerOrderParams = {
  page: number;
  limit: number;
  search: string;
  status?: string;
};