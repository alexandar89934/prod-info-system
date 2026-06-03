import { Request, Response } from "express";
import httpStatus from "http-status";

import { maintenanceTemplateService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllMaintenanceTemplates = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const search = String(req.query.search ?? "");
  const offset = (page - 1) * limit;
  const { rows, total } = await maintenanceTemplateService.getAllMaintenanceTemplates(search, limit, offset);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { items: rows, pagination: { total, page, limit } },
  });
});

export const getMaintenanceTemplateById = catchAsync(async (req: Request, res: Response) => {
  const template = await maintenanceTemplateService.getMaintenanceTemplateById(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { maintenanceTemplate: template },
  });
});

export const createMaintenanceTemplate = catchAsync(async (req: Request, res: Response) => {
  const template = await maintenanceTemplateService.createMaintenanceTemplate(req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Maintenance template created successfully!",
    content: { maintenanceTemplate: template },
  });
});

export const updateMaintenanceTemplate = catchAsync(async (req: Request, res: Response) => {
  const template = await maintenanceTemplateService.updateMaintenanceTemplate({
    ...req.body,
    id: req.params.id,
  });
  res.status(httpStatus.OK).send({
    success: true,
    message: "Maintenance template updated successfully!",
    content: { maintenanceTemplate: template },
  });
});

export const deleteMaintenanceTemplate = catchAsync(async (req: Request, res: Response) => {
  const deleted = await maintenanceTemplateService.deleteMaintenanceTemplate(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Maintenance template deleted successfully!",
    content: { deleted },
  });
});