import { Request, Response } from "express";
import httpStatus from "http-status";

import { customerOrderService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllCustomerOrders = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const search = String(req.query.search ?? "");
  const status = req.query.status ? String(req.query.status) : undefined;
  const offset = (page - 1) * limit;
  const { rows, total } = await customerOrderService.getAllCustomerOrders(search, limit, offset, status);
  res.status(httpStatus.OK).send({
    success: true,
    message: "OK",
    content: { customerOrders: rows, pagination: { total, page, limit } },
  });
});

export const getCustomerOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await customerOrderService.getCustomerOrderById(req.params.id);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { customerOrder: order } });
});

export const createCustomerOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await customerOrderService.createCustomerOrder(req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Customer order created successfully!",
    content: { customerOrder: order },
  });
});

export const updateCustomerOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await customerOrderService.updateCustomerOrder({ ...req.body, id: req.params.id });
  res.status(httpStatus.OK).send({
    success: true,
    message: "Customer order updated successfully!",
    content: { customerOrder: order },
  });
});

export const deleteCustomerOrder = catchAsync(async (req: Request, res: Response) => {
  const deleted = await customerOrderService.deleteCustomerOrder(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Customer order deleted successfully!",
    content: { deleted },
  });
});

export const addOrderLine = catchAsync(async (req: Request, res: Response) => {
  const line = await customerOrderService.addOrderLine({
    customerOrderId: req.params.id,
    itemId: req.body.itemId,
    quantity: req.body.quantity,
  });
  res.status(httpStatus.OK).send({
    success: true,
    message: "Order line added successfully!",
    content: { line },
  });
});

export const deleteOrderLine = catchAsync(async (req: Request, res: Response) => {
  const deleted = await customerOrderService.deleteOrderLine(req.params.lineId);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Order line deleted successfully!",
    content: { deleted },
  });
});