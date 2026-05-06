import { Request, Response } from "express";
import httpStatus from "http-status";

import { packagingUnitService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllPackagingUnits = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const search = String(req.query.search ?? "");
  const offset = (page - 1) * limit;
  const { rows, total } = await packagingUnitService.getAllPackagingUnits(search, limit, offset);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { packagingUnits: rows, pagination: { total, page, limit } } });
});

export const getPackagingUnitById = catchAsync(async (req: Request, res: Response) => {
  const unit = await packagingUnitService.getPackagingUnitById(req.params.id);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { packagingUnit: unit } });
});

export const createPackagingUnit = catchAsync(async (req: Request, res: Response) => {
  const unit = await packagingUnitService.createPackagingUnit(req.body);
  res.status(httpStatus.OK).send({ success: true, message: "Packaging unit created successfully!", content: { packagingUnit: unit } });
});

export const updatePackagingUnit = catchAsync(async (req: Request, res: Response) => {
  const unit = await packagingUnitService.updatePackagingUnit({ ...req.body, id: req.params.id });
  res.status(httpStatus.OK).send({ success: true, message: "Packaging unit updated successfully!", content: { packagingUnit: unit } });
});

export const deletePackagingUnit = catchAsync(async (req: Request, res: Response) => {
  const deleted = await packagingUnitService.deletePackagingUnit(req.params.id);
  res.status(httpStatus.OK).send({ success: true, message: "Packaging unit deleted successfully!", content: { deleted } });
});