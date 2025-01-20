import { Request, Response } from "express";
import httpStatus from "http-status";

import { signInService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const adminSignIn = catchAsync(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const signInData = await signInService.adminSignIn(username, password);

  res
    .status(httpStatus.OK)
    .header("token", signInData.token)
    .send({
      success: true,
      message: "Successfully logged in!",
      content: {
        name: signInData.user.name,
      },
    });
});
