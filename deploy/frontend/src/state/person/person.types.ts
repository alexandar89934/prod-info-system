export interface DocumentData {
  path: string;
  name: string;
  value: string;
}

export interface AddPersonFormData {
  profileImage: string;
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture: string;
  additionalInfo: string;
  documents: DocumentData[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface EditPersonFormData {
  id: string;
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture: string;
  additionalInfo: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface GetPersonsData {
  id: string;
  profileImage: string;
  employeeNumber: number;
  name: string;
  address: string;
  mail: string;
  picture: string;
  additionalInfo: string;
  documents: DocumentData[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PersonState {
  documents: any;
  persons: AddPersonFormData[];
  person: AddPersonFormData;
  total: number;
  loading: boolean;
  error: string | null;
}
