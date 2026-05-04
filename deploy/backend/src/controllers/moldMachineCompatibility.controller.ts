import { Request, Response } from "express";
import httpStatus from "http-status";

import { moldMachineCompatibilityService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getCompatibleMachines = catchAsync(async (req: Request, res: Response) => {
  const { moldId } = req.params;
  if (!moldId) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ success: false, message: "Missing or invalid mold ID." });
  }
  const compatibilities = await moldMachineCompatibilityService.getCompatibleMachinesForMold(moldId);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched compatible machines for mold.",
    content: { compatibilities },
  });
});

export const createCompatibility = catchAsync(async (req: Request, res: Response) => {
  const compatibility = await moldMachineCompatibilityService.createMoldMachineCompatibility(req.body);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully created mold-machine compatibility!",
    content: { compatibility },
  });
});

export const updateCompatibility = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ success: false, message: "Missing or invalid compatibility ID." });
  }
  const compatibility = await moldMachineCompatibilityService.updateMoldMachineCompatibility({
    ...req.body,
    id,
  });
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully updated mold-machine compatibility!",
    content: { compatibility },
  });
});

export const deleteCompatibility = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ success: false, message: "Missing or invalid compatibility ID." });
  }
  const deleted = await moldMachineCompatibilityService.deleteMoldMachineCompatibility(id);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully deleted mold-machine compatibility!",
    content: { deleted },
  });
});