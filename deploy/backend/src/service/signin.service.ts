import { deleteRefreshTokenByUserQuery } from "../models/refreshToken.model";
import { getUserByEmployeeNumber } from "../models/user.model";
import { ApiError } from "../shared/error/ApiError";
import { AuthError } from "../shared/error/AuthError";
import { compareHashedData } from "../shared/utils/hash";
import { encodeJWT } from "../shared/utils/token";

import { getUserById } from "./user.service";

export const userSignIn = async (employeeNumber: string, password: string) => {
  const user = await getUserByEmployeeNumber(employeeNumber);

  if (!user) {
    throw new AuthError("Wrong username or password");
  }

  const passwordIsCorrect = compareHashedData(password, user.password);

  if (!passwordIsCorrect) {
    throw new AuthError("Wrong username or password");
  }

  // FIXME: A ne pravis mu refresh token?
  return {
    token: encodeJWT<{ userId: string }>({
      userId: user.id,
    }),
    user,
  };
};

export const logout = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    // FIXME: 404 status
    throw new ApiError("User does not exist");
  }
  await deleteRefreshTokenByUserQuery(user.id);
};
