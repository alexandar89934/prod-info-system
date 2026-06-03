import { Request, Response } from "express";
import httpStatus from "http-status";

import { machineKioskService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const verifyKioskAccess = catchAsync(async (req: Request, res: Response) => {
  const { employeeNumber, pin } = req.body as { employeeNumber: string; pin: string };
  const result = await machineKioskService.verifyKioskAccess(employeeNumber, pin ?? "");
  res.status(httpStatus.OK).send({ success: true, message: "Authorized", content: result });
});