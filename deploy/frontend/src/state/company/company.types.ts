import { ApiResponse } from '@/state/defaultResponse';

export type CompanyEmail = { address: string; isPrimary: boolean };

export type Company = {
  id: string;
  name: string;
  pib: string;
  mb: string;
  address: string | null;
  phones: string[];
  emails: CompanyEmail[];
  ownerInfo: string | null;
  representative: string | null;
  isOwnCompany: boolean;
  isCustomer: boolean;
  isSupplier: boolean;
  notes: string | null;
  logo: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CompanyListItem = Pick<Company, 'id' | 'name'>;

export type CompanySingleResponse = ApiResponse<{ company: Company }>;
export type CompanyListResponse = ApiResponse<{
  companies: Company[];
  pagination: { total: number; page: number; limit: number };
}>;
export type CompanySelectListResponse = ApiResponse<{ companies: CompanyListItem[] }>;

export type FetchCompanyParams = { page: number; limit: number; search: string };

export type CompanyState = {
  companies: Company[];
  currentCompany: Company | null;
  companiesList: CompanyListItem[];
  loading: boolean;
  error: string | null;
  success: string | null;
  total: number;
};