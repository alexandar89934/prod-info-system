import {
  createRefreshTokenQuery,
  deleteRefreshTokenByUserQuery,
  getRefreshTokenQuery,
} from "../models/refreshToken.model";
import { encodeJWTRefresh, readPayloadOfToken } from "../shared/utils/token";

import { RefreshToken } from "./refreshToken.service.model";
import { getUserById } from "./user.service";

export const createRefreshToken = async (userId: string) => {
  const refreshToken = encodeJWTRefresh<{ userId: string }>({ userId });
  return createRefreshTokenQuery(userId, refreshToken);
};

export const renewAccessToken = async (refreshToken: string) => {
  const databaseRefreshToken = await getRefreshTokenQuery(refreshToken);
  if (!databaseRefreshToken) {
    const decoded = readPayloadOfToken<RefreshToken>(refreshToken);
    await deleteRefreshTokenByUserQuery(decoded.userId);
    return null;
  }
  const user = await getUserById(databaseRefreshToken.userId);
  const accessToken = encodeJWTRefresh<{ userId: string }>({
    userId: user.id,
  });

  const newRefreshToken = encodeJWTRefresh<{ userId: string }>({
    userId: databaseRefreshToken.userId,
  });

  return {
    token: accessToken,
    refreshToken: await createRefreshTokenQuery(
      databaseRefreshToken.userId,
      newRefreshToken,
    ),
  };
};
