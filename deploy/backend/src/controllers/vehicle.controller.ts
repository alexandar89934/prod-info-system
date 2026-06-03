import { Request, Response } from "express";
import httpStatus from "http-status";

import { vehicleService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllVehicles = catchAsync(async (req: Request, res: Response) => {
  const page   = parseInt(String(req.query.page   ?? "1"),  10);
  const limit  = parseInt(String(req.query.limit  ?? "50"), 10);
  const search = String(req.query.search ?? "");
  const offset = (page - 1) * limit;
  const { rows, total } = await vehicleService.getAllVehicles(search, limit, offset);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { items: rows, pagination: { total, page, limit } },
  });
});

export const getVehicleById = catchAsync(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { vehicle },
  });
});

export const createVehicle = catchAsync(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Vehicle created successfully!",
    content: { vehicle },
  });
});

export const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  const vehicle = await vehicleService.updateVehicle({ ...req.body, id: req.params.id });
  res.status(httpStatus.OK).send({
    success: true,
    message: "Vehicle updated successfully!",
    content: { vehicle },
  });
});

export const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  await vehicleService.deleteVehicle(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Vehicle deleted successfully!",
    content: null,
  });
});