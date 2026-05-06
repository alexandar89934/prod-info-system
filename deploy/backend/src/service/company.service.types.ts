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
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateCompanyData = Omit<Company, "id" | "createdAt" | "updatedAt">;
export type EditCompanyData = Omit<Company, "createdAt" | "updatedAt">;