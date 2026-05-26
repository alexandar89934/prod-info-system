import { Request, Response } from "express";
import httpStatus from "http-status";

import { productionPlanService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";
import { ProductionPlanStatus } from "../service/productionPlan.service.types";

export const getAllProductionPlans = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const machineId = req.query.machineId ? String(req.query.machineId) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const offset = (page - 1) * limit;
  const { rows, total } = await productionPlanService.getAllProductionPlans(limit, offset, machineId, status);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { productionPlans: rows, pagination: { total, page, limit } },
  });
});

export const getProductionPlansByOrder = catchAsync(async (req: Request, res: Response) => {
  const plans = await productionPlanService.getProductionPlansByOrder(req.params.orderId);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { productionPlans: plans } });
});

export const getProductionPlansByMachine = catchAsync(async (req: Request, res: Response) => {
  const plans = await productionPlanService.getProductionPlansByMachine(req.params.machineId);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { productionPlans: plans } });
});

export const getProductionPlanById = catchAsync(async (req: Request, res: Response) => {
  const plan = await productionPlanService.getProductionPlanById(req.params.id);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { productionPlan: plan } });
});

export const createProductionPlan = catchAsync(async (req: Request, res: Response) => {
  const plan = await productionPlanService.createProductionPlan(req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Production plan created successfully!",
    content: { productionPlan: plan },
  });
});

export const updateProductionPlan = catchAsync(async (req: Request, res: Response) => {
  const plan = await productionPlanService.updateProductionPlan({ ...req.body, id: req.params.id });
  res.status(httpStatus.OK).send({
    success: true,
    message: "Production plan updated successfully!",
    content: { productionPlan: plan },
  });
});

export const updateProductionPlanStatus = catchAsync(async (req: Request, res: Response) => {
  const producedQuantity = req.body.producedQuantity != null ? Number(req.body.producedQuantity) : null;
  const plan = await productionPlanService.updateProductionPlanStatus(
    req.params.id,
    req.body.status as ProductionPlanStatus,
    producedQuantity,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: "Status updated successfully!",
    content: { productionPlan: plan },
  });
});

export const deleteProductionPlan = catchAsync(async (req: Request, res: Response) => {
  const deleted = await productionPlanService.deleteProductionPlan(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Production plan deleted successfully!",
    content: { deleted },
  });
});

export const getAllPlansByMachine = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const plans = await productionPlanService.getAllProductionPlansByMachine(req.params.machineId, search);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { productionPlans: plans } });
});

export const reorderPlans = catchAsync(async (req: Request, res: Response) => {
  await productionPlanService.reorderProductionPlans(req.params.machineId, req.body.plans);
  res.status(httpStatus.OK).send({ success: true, message: "Plans reordered successfully!", content: {} });
});

export const machineCycleEvent = catchAsync(async (req: Request, res: Response) => {
  const machineNumber = parseInt(req.body.machineNumber, 10);
  if (!machineNumber || machineNumber < 1) {
    res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "machineNumber is required and must be a positive integer" });
    return;
  }
  const result = await productionPlanService.processMachineCycleEvent(machineNumber);
  res.status(httpStatus.OK).send({ success: true, message: "Cycle event processed", content: result });
});