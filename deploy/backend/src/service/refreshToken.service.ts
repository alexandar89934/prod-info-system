import { logger } from "#logger";

import {
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
} from "../infrastructure/refreshToken.redis";
import {
  encodeJWT,
  encodeJWTRefresh,
  readPayloadOfToken,
} from "../shared/utils/token";

import { RefreshToken } from "./refreshToken.service.model";

export const createRefreshToken = async (userId: string, device: string) => {
  try {
    const refreshToken = encodeJWTRefresh<{ userId: string; device: string }>({
      userId,
      device,
    });

    await setRefreshToken(userId, refreshToken, device);

    return {
      userId,
      refreshToken,
      device,
    };
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to create refresh token");
  }
};
export const renewAccessToken = async (
  refreshToken: string,
  device: string,
) => {
  try {
    const decoded = readPayloadOfToken<RefreshToken>(refreshToken);
    const { userId } = decoded;

    const storedToken = await getRefreshToken(userId, device);
    if (!storedToken || storedToken !== refreshToken) {
      await deleteRefreshToken(userId, device);
      return null;
    }

    const newAccessToken = encodeJWT<{ userId: string }>({ userId });

    const newRefreshToken = encodeJWTRefresh<{
      userId: string;
      device: string;
    }>({
      userId,
      device,
    });

    await setRefreshToken(userId, newRefreshToken, device);

    return {
      token: newAccessToken,
      refreshToken: {
        userId,
        refreshToken: newRefreshToken,
        device,
      },
    };
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to renew access token");
  }
};
