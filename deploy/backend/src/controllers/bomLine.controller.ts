import { Request, Response } from "express";
import httpStatus from "http-status";

import { bomLineService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getBomLinesByOutputItem = catchAsync(async (req: Request, res: Response) => {
  const { outputItemId } = req.params;
  if (!outputItemId) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing output item ID." });
  }
  const bomLines = await bomLineService.getBomLinesByOutputItem(outputItemId);
  return res.status(httpStatus.OK).send({ success: true, message: "OK", content: { bomLines } });
});

export const createBomLine = catchAsync(async (req: Request, res: Response) => {
  const bomLine = await bomLineService.createBomLine(req.body);
  res.status(httpStatus.OK).send({ success: true, message: "Successfully created BOM line!", content: { bomLine } });
});

export const updateBomLine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid BOM line ID." });
  }
  const bomLine = await bomLineService.updateBomLine({ ...req.body, id });
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully updated BOM line!", content: { bomLine } });
});

export const deleteBomLine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid BOM line ID." });
  }
  const deleted = await bomLineService.deleteBomLine(id);
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully deleted BOM line!", content: { deleted } });
});