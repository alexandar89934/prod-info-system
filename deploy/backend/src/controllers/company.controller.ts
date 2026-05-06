import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import httpStatus from "http-status";

import { companyService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllCompanies = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const search = String(req.query.search ?? "");
  const offset = (page - 1) * limit;
  const { rows, total } = await companyService.getAllCompanies(search, limit, offset);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { companies: rows, pagination: { total, page, limit } } });
});

export const getAllCompaniesList = catchAsync(async (_req: Request, res: Response) => {
  const companies = await companyService.getAllCompaniesList();
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { companies } });
});

export const getCompanyById = catchAsync(async (req: Request, res: Response) => {
  const company = await companyService.getCompanyById(req.params.id);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { company } });
});

export const createCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await companyService.createCompany(req.body);
  res.status(httpStatus.OK).send({ success: true, message: "Company created successfully!", content: { company } });
});

export const updateCompany = catchAsync(async (req: Request, res: Response) => {
  const company = await companyService.updateCompany({ ...req.body, id: req.params.id });
  res.status(httpStatus.OK).send({ success: true, message: "Company updated successfully!", content: { company } });
});

export const deleteCompany = catchAsync(async (req: Request, res: Response) => {
  const deleted = await companyService.deleteCompany(req.params.id);
  res.status(httpStatus.OK).send({ success: true, message: "Company deleted successfully!", content: { deleted } });
});

export const uploadCompanyLogo = (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
  const logoPath = `/uploads/temp/${req.file.filename}`;
  return res.status(200).json({ success: true, path: logoPath });
};

export const deleteCompanyLogo = catchAsync(async (req: Request, res: Response) => {
  const company = await companyService.getCompanyById(req.params.id);
  if (company.logo) {
    const fileName = company.logo.replace("/uploads/temp/", "").replace("/uploads/", "");
    const uploadsDir = path.join(__dirname, "../uploads");
    const filePath = path.join(uploadsDir, fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const tempPath = path.join(uploadsDir, "temp", fileName);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
  const updated = await companyService.updateCompany({ ...company, logo: null });
  res.status(httpStatus.OK).send({ success: true, message: "Logo removed.", content: { company: updated } });
});