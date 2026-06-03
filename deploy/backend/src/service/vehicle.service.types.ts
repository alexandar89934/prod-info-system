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

export type CreateVehicleData = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
export type EditVehicleData   = Omit<Vehicle, 'createdAt' | 'updatedAt'>;