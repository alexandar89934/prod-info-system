import { Response } from "express";
import httpStatus from "http-status";

import { roleService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllRoles = catchAsync(async (_req: Request, res: Response) => {
  const roles = await roleService.getAllRoles();
  res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched roles.",
    content: roles,
  });
});
