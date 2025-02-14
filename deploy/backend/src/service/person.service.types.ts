export type CreatePersonData = {
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture?: string;
  additional_info?: string;
  documents?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Date;
  updatedBy: Date;
};

export type GetAllPersonsData = {
  persons: CreatePersonData[]; // Array of persons returned
  totalPersons: number; // Total number of persons for pagination
  currentPage: number; // Current page number
  totalPages: number; // Total number of pages based on the limit
};

export type EditPersonData = {
  id: string;
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture?: string;
  additional_info?: string;
  documents?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Date;
  updatedBy: Date;
};

export type PersonDocument = {
  name: string;
  path: string;
  dateAdded: Date;
};
