import { Request, Response } from "express";
import httpStatus from "http-status";

import { signInService, refreshTokenService } from "../service";
import { ApiError } from "../shared/error/ApiError";
import { catchAsync } from "../shared/utils/CatchAsync";
import { readPayloadOfToken } from "../shared/utils/token";

import { config } from "./../config/config";

export const userSignIn = catchAsync(async (req: Request, res: Response) => {
  const { employeeNumber, password } = req.body;

  const signInData = await signInService.userSignIn(employeeNumber, password);
  const { refreshValidity = 10 * 60 * 1000 } = config.jwt;

  const refreshTokenData = await refreshTokenService.createRefreshToken(
    signInData.user.id,
  );
  res
    .status(httpStatus.OK)
    .header("token", signInData.token)
    .cookie("refreshToken", refreshTokenData.token, {
      maxAge: Number(refreshValidity) * 1000,
      httpOnly: true,
    })
    .send({
      success: true,
      message: "Successfully logged in!",
      content: {
        name: signInData.user.name,
        id: signInData.user.id,
        picture: signInData.user.picture,
        employeeNumber: signInData.user.employeeNumber,
      },
    });
});

export const renewAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const { refreshValidity = 10 * 60 * 1000 } = config.jwt;
    const refreshToken = req.headers.cookie
      ?.split(";")
      .filter((cookie) => cookie.includes("refreshToken="));
    if (!refreshToken || !refreshToken.length) {
      throw new ApiError("No refresh token", httpStatus.BAD_REQUEST);
    }

    const renewedTokens = await refreshTokenService.renewAccessToken(
      refreshToken[0].split("=")[1] as string,
    );
    if (!renewedTokens) {
      res.status(httpStatus.BAD_REQUEST).clearCookie("refreshToken").send({
        success: false,
        message: "Refresh token used",
        removeUser: true,
      });
      return;
    }

    res
      .status(httpStatus.OK)
      .cookie("refreshToken", renewedTokens.refreshToken.token, {
        maxAge: Number(refreshValidity) * 1000,
        httpOnly: true,
      })
      .header("token", renewedTokens.token)
      .send({
        success: true,
        message: "Successfully renewed tokens.",
      });
  },
);

export const userLogout = catchAsync(async (req: Request, res: Response) => {
  const { userId } = readPayloadOfToken<{ userId: string }>(
    req.headers.token as string,
  );

  await signInService.logout(userId);
  res.status(httpStatus.OK).clearCookie("refreshToken").send({
    success: true,
    message: "Successfully logged out.",
  });
});
