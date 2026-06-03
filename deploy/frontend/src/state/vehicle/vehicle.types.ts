export type VehicleType = 'car' | 'forklift' | 'truck' | 'other';

export type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string | null;
  model: string | null;
  yearOfManufacture: number | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleState = {
  items: Vehicle[];
  current: Vehicle | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};

export type FetchVehicleParams = {
  page: number;
  limit: number;
  search: string;
};

export type VehicleListResponse = {
  success: boolean;
  message: string;
  content: {
    items: Vehicle[];
    pagination: { total: number; page: number; limit: number };
  };
};

export type VehicleSingleResponse = {
  success: boolean;
  message: string;
  content: { vehicle: Vehicle };
};