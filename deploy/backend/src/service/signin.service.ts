import { deleteRefreshToken } from "../infrastructure/refreshToken.redis";
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
  // FIXED: Refresh token se pravi ali se poziva u userSignIn controller-u
  return {
    token: encodeJWT<{ userId: string }>({
      userId: user.id,
    }),
    user,
  };
};

export const logout = async (userId: string, device: string) => {
  const user = await getUserById(userId);
  if (!user) {
    // FIXME: 404 status
    // FIXED
    throw new ApiError("User does not exist", 404);
  }
  await deleteRefreshToken(user.id, device);
};
