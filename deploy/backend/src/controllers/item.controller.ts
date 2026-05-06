import { Request, Response } from "express";
import httpStatus from "http-status";

import { itemService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllItems = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search = "", sortField = "", sortOrder = "" } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const { items, totalItems } = await itemService.getAllItems(
    Number(limit),
    offset,
    String(search),
    String(sortField),
    String(sortOrder),
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched items.",
    content: { items, pagination: { total: totalItems, page: Number(page), limit: Number(limit) } },
  });
});

export const getItemById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid item ID." });
  }
  const item = await itemService.getItemById(id);
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully fetched item.", content: { item } });
});

export const getItemsByMold = catchAsync(async (req: Request, res: Response) => {
  const { moldId } = req.params;
  if (!moldId) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing mold ID." });
  }
  const items = await itemService.getItemsByMold(moldId);
  return res.status(httpStatus.OK).send({ success: true, message: "OK", content: { items } });
});

export const createItem = catchAsync(async (req: Request, res: Response) => {
  const item = await itemService.createItem(req.body);
  res.status(httpStatus.OK).send({ success: true, message: "Successfully created item!", content: { item } });
});

export const updateItem = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid item ID." });
  }
  const item = await itemService.updateItem({ ...req.body, id });
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully updated item!", content: { item } });
});

export const deleteItem = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid item ID." });
  }
  const deleted = await itemService.deleteItem(id);
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully deleted item!", content: { deleted } });
});