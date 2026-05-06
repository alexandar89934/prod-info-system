import httpStatus from "http-status";

import {
  createCompanyQuery,
  deleteCompanyQuery,
  getAllCompaniesListQuery,
  getAllCompaniesQuery,
  getCompanyByIdQuery,
  updateCompanyQuery,
} from "../models/company.model";
import { ApiError } from "../shared/error/ApiError";
import { Company, CreateCompanyData, EditCompanyData } from "./company.service.types";

export const getAllCompanies = async (search: string, limit: number, offset: number) => {
  try {
    return await getAllCompaniesQuery(search, limit, offset);
  } catch (error) {
    throw new ApiError("Error fetching companies!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getAllCompaniesList = async (): Promise<Pick<Company, "id" | "name">[]> => {
  try {
    return await getAllCompaniesListQuery();
  } catch (error) {
    throw new ApiError("Error fetching companies list!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getCompanyById = async (id: string): Promise<Company> => {
  try {
    const company = await getCompanyByIdQuery(id);
    if (!company) throw new ApiError("Company not found.", httpStatus.NOT_FOUND);
    return company;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error fetching company!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const createCompany = async (data: CreateCompanyData): Promise<Company> => {
  try {
    return await createCompanyQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("A company with this PIB or MB already exists.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error creating company!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const updateCompany = async (data: EditCompanyData): Promise<Company> => {
  try {
    const existing = await getCompanyByIdQuery(data.id);
    if (!existing) throw new ApiError("Company not found.", httpStatus.NOT_FOUND);
    return await updateCompanyQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const err = error as Error;
    if (err.message?.includes("duplicate key") || err.message?.includes("unique constraint")) {
      throw new ApiError("A company with this PIB or MB already exists.", httpStatus.CONFLICT);
    }
    throw new ApiError("Error updating company!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const deleteCompany = async (id: string): Promise<Company> => {
  try {
    const existing = await getCompanyByIdQuery(id);
    if (!existing) throw new ApiError("Company not found.", httpStatus.NOT_FOUND);
    return await deleteCompanyQuery(id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error deleting company!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};