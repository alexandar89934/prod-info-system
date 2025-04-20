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
    req.header("user-agent") as string,
  );
  res
    .status(httpStatus.OK)
    .header("token", signInData.token)
    .cookie("refreshToken", refreshTokenData.refreshToken, {
      maxAge: Number(refreshValidity) * 1000,
      secure: false,
      httpOnly: true,
      sameSite: "lax",
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
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError("No refresh token", httpStatus.BAD_REQUEST);
    }
    const renewedTokens = await refreshTokenService.renewAccessToken(
      refreshToken,
      req.header("user-agent") as string,
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
      .cookie("refreshToken", renewedTokens.refreshToken.refreshToken, {
        maxAge: Number(refreshValidity) * 1000,
        secure: false,
        httpOnly: true,
        sameSite: "lax",
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

  await signInService.logout(userId, req.header("user-agent") as string);
  res.status(httpStatus.OK).clearCookie("refreshToken").send({
    success: true,
    message: "Successfully logged out.",
  });
});
