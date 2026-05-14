export type CustomerOrderStatus = "open" | "in_plan" | "fulfilled";

export type CustomerOrderLine = {
  id: string;
  customerOrderId: string;
  itemId: string;
  quantity: number;
  itemCode?: string;
  itemName?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  deliveryDate: string | null;
  notes: string | null;
  status: CustomerOrderStatus;
  createdAt: string;
  updatedAt: string;
  lines?: CustomerOrderLine[];
};

export type CreateCustomerOrderData = {
  customerId: string;
  deliveryDate?: string | null;
  notes?: string | null;
  lines: Array<{ itemId: string; quantity: number }>;
};

export type UpdateCustomerOrderData = {
  id: string;
  customerId: string;
  deliveryDate?: string | null;
  notes?: string | null;
  status: CustomerOrderStatus;
};

export type AddOrderLineData = {
  customerOrderId: string;
  itemId: string;
  quantity: number;
};