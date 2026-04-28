export type PersonStatus = "working" | "off" | "vacation" | "sick" | "break";

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
  jobPositions?: number[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  rfidCardNumber?: string | null;
  status?: PersonStatus;
  currentPositionId?: number | null;
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
