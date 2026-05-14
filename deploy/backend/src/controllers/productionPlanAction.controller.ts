import { Request, Response } from "express";
import httpStatus from "http-status";

import { productionPlanActionService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getActionsByPlan = catchAsync(async (req: Request, res: Response) => {
  const actions = await productionPlanActionService.getByPlanId(req.params.planId);
  res.status(httpStatus.OK).send({ success: true, message: "OK", content: { actions } });
});

export const createAction = catchAsync(async (req: Request, res: Response) => {
  const action = await productionPlanActionService.create(req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: "Action logged successfully!",
    content: { action },
  });
});

export const verifyActionPermission = catchAsync(async (req: Request, res: Response) => {
  const { employeeNumber, pin, actionType } = req.body as {
    employeeNumber: string;
    pin: string;
    actionType: string;
  };
  const result = await productionPlanActionService.verifyActionPermission(
    employeeNumber,
    pin ?? "",
    actionType as Parameters<typeof productionPlanActionService.verifyActionPermission>[2]
  );
  res.status(httpStatus.OK).send({ success: true, message: "Authorized", content: result });
});