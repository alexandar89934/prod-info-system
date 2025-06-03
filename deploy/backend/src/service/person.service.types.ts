type PersonData = {
  id?: string;
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture?: string;
  additionalInfo?: string;
  documents?: Record<string, unknown>;
  roles?: number[];
  workplaces?: number[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

export type CreatePersonData = PersonData;

export type EditPersonData = PersonData & {
  id: string;
};
export type GetAllPersonsData = {
  persons: CreatePersonData[];
  totalPersons: number;
  currentPage: number;
  totalPages: number;
};
