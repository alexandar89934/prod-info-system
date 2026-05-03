import { Request, Response } from "express";
import httpStatus from "http-status";

import { systemConfigService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllSystemConfigs = catchAsync(async (_req: Request, res: Response) => {
  const configs = await systemConfigService.getAllSystemConfigs();
  res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched system configs.",
    content: { configs },
  });
});

export const getSystemConfigByKey = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;
  if (!key) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "Missing config key.",
    });
  }
  const config = await systemConfigService.getSystemConfigByKey(key);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched system config.",
    content: { config },
  });
});

export const updateSystemConfig = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;
  if (!key) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "Missing config key.",
    });
  }
  const config = await systemConfigService.updateSystemConfig({ key, value: req.body.value });
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully updated system config.",
    content: { config },
  });
});