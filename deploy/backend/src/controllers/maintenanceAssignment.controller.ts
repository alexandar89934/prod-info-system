import { Request, Response } from "express";
import httpStatus from "http-status";

import { maintenanceAssignmentService } from "../service";
import { TargetType } from "../service/maintenanceAssignment.service.types";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllMaintenanceAssignments = catchAsync(async (req: Request, res: Response) => {
  const page   = parseInt(String(req.query.page   ?? "1"),  10);
  const limit  = parseInt(String(req.query.limit  ?? "50"), 10);
  const search = String(req.query.search ?? "");
  const offset = (page - 1) * limit;
  const { rows, total } = await maintenanceAssignmentService.getAllMaintenanceAssignments(search, limit, offset);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { items: rows, pagination: { total, page, limit } },
  });
});

export const getAssignmentsByTemplate = catchAsync(async (req: Request, res: Response) => {
  const assignments = await maintenanceAssignmentService.getAssignmentsByTemplate(req.params.templateId);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { assignments },
  });
});

export const getAvailableTargets = catchAsync(async (req: Request, res: Response) => {
  const { targetType, templateId } = req.params;
  const targets = await maintenanceAssignmentService.getAvailableTargets(targetType as TargetType, templateId);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { targets },
  });
});

export const createMaintenanceAssignments = catchAsync(async (req: Request, res: Response) => {
  const created = await maintenanceAssignmentService.createMaintenanceAssignments(req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Assignments created successfully!",
    content: { assignments: created },
  });
});

export const deleteMaintenanceAssignment = catchAsync(async (req: Request, res: Response) => {
  await maintenanceAssignmentService.deleteMaintenanceAssignment(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Assignment removed successfully!",
    content: null,
  });
});