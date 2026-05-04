import { Request, Response } from "express";
import httpStatus from "http-status";

import { moldService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllMolds = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortField = "",
    sortOrder = "",
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const { molds, totalMolds } = await moldService.getAllMolds(
    Number(limit),
    offset,
    String(search),
    String(sortField),
    String(sortOrder),
  );

  res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched molds.",
    content: {
      molds,
      pagination: { total: totalMolds, page: Number(page), limit: Number(limit) },
    },
  });
});

export const getMoldById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid mold ID." });
  }
  const mold = await moldService.getMoldById(id);
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully fetched mold by ID.", content: { mold } });
});

export const createMold = catchAsync(async (req: Request, res: Response) => {
  const mold = await moldService.createMold(req.body);
  res.status(httpStatus.OK).send({ success: true, message: "Successfully created mold!", content: { mold } });
});

export const updateMold = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid mold ID." });
  }
  const mold = await moldService.updateMold({ ...req.body, id });
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully updated mold!", content: { mold } });
});

export const getMoldMountedOnMachine = catchAsync(async (req: Request, res: Response) => {
  const { machineId } = req.params;
  if (!machineId) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing machine ID." });
  }
  const mold = await moldService.getMoldMountedOnMachine(machineId);
  return res.status(httpStatus.OK).send({ success: true, message: "OK", content: { mold } });
});

export const deleteMold = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing or invalid mold ID." });
  }
  const deleted = await moldService.deleteMold(id);
  return res.status(httpStatus.OK).send({ success: true, message: "Successfully deleted mold!", content: { deleted } });
});