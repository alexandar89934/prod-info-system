import { Request, Response } from "express";
import httpStatus from "http-status";

import { itemPackagingService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getItemPackagingsByItem = catchAsync(async (req: Request, res: Response) => {
  const packagings = await itemPackagingService.getItemPackagingsByItem(req.params.itemId);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { packagings } });
});

export const createItemPackaging = catchAsync(async (req: Request, res: Response) => {
  const packaging = await itemPackagingService.createItemPackaging({ ...req.body, itemId: req.params.itemId });
  res.status(httpStatus.OK).send({ success: true, message: "Item packaging created!", content: { packaging } });
});

export const updateItemPackaging = catchAsync(async (req: Request, res: Response) => {
  const packaging = await itemPackagingService.updateItemPackaging({ ...req.body, id: req.params.id });
  res.status(httpStatus.OK).send({ success: true, message: "Item packaging updated!", content: { packaging } });
});

export const deleteItemPackaging = catchAsync(async (req: Request, res: Response) => {
  const deleted = await itemPackagingService.deleteItemPackaging(req.params.id);
  res.status(httpStatus.OK).send({ success: true, message: "Item packaging deleted!", content: { deleted } });
});