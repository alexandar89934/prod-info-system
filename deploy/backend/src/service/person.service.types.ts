export type CreatePersonData = {
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture?: string;
  additionalInfo?: string;
  documents?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Date;
  updatedBy: Date;
};

export type GetAllPersonsData = {
  persons: CreatePersonData[];
  totalPersons: number;
  currentPage: number;
  totalPages: number;
};

export type EditPersonData = {
  id: string;
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture?: string;
  additionalInfo?: string;
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
