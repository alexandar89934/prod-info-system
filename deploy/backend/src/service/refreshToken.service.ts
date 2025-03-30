import {
  createRefreshTokenQuery,
  deleteRefreshTokenByUserQuery,
  getRefreshTokenQuery,
} from "../models/refreshToken.model";
import {
  decodeJWT,
  encodeJWTRefresh,
  readPayloadOfToken,
} from "../shared/utils/token";

import { RefreshToken } from "./refreshToken.service.model";
import { getUserById } from "./user.service";

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const createRefreshToken = async (userId: string) => {
  const refreshToken = encodeJWTRefresh<{ userId: string }>({ userId });
  const decodedToken = decodeJWT(refreshToken) as DecodedToken;
  return createRefreshTokenQuery(
    userId,
    refreshToken,
    new Date(decodedToken.exp * 1000).toISOString(),
  );
};

export const renewAccessToken = async (refreshToken: string) => {
  // FIXME: Try catch?
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
      new Date(databaseRefreshToken.expiryDate).toISOString(),
    ),
  };
};
