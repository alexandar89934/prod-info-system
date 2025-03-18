import { RefreshToken } from "../service/refreshToken.service.model";

import { callQuery } from "./utils/query";

export const createRefreshTokenQuery = async (
  userId: string,
  refreshToken: string,
  expiryDate: string,
): Promise<RefreshToken> => {
  const insertSQL = `
    INSERT INTO "RefreshTokens" ("userId", "token", "expiryDate", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("userId") 
    DO UPDATE SET
      "token" = $2,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [userId, refreshToken, expiryDate];

  return callQuery<RefreshToken>(insertSQL, values);
};

export const getRefreshTokenQuery = async (
  refreshToken: string,
): Promise<RefreshToken> => {
  const selectSQL = `
      SELECT * FROM "RefreshTokens" WHERE "token" = $1;
  `;
  const values = [refreshToken];

  return callQuery<RefreshToken>(selectSQL, values);
};

export const deleteRefreshTokenByUserQuery = async (userId: string) => {
  const selectSQL = `
      DELETE FROM "RefreshTokens" WHERE "userId" = $1 RETURNING *;
  `;

  const values = [userId];

  return callQuery<RefreshToken>(selectSQL, values);
};
