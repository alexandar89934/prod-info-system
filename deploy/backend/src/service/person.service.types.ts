export type CreatePersonData = {
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture?: string;
  additionalInfo?: string;
  documents?: Record<string, unknown>;
  roles?: number[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
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
  roles?: number[];
  startDate: Date;
  endDate: Date;
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
