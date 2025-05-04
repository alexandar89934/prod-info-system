import { deleteRefreshToken } from "../infrastructure/refreshToken.redis";
import {
  getUserByEmployeeNumber,
  updateUserPasswordQuery,
} from "../models/user.model";
import { ApiError } from "../shared/error/ApiError";
import { AuthError } from "../shared/error/AuthError";
import { compareHashedData, hashSensitiveData } from "../shared/utils/hash";
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

  return {
    token: encodeJWT<{ userId: string }>({
      userId: user.id,
    }),
    user,
  };
};

export const resetPassword = async (
  employeeNumber: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
) => {
  const user = await getUserByEmployeeNumber(employeeNumber);
  if (!user) {
    throw new AuthError("User not found");
  }

  const isMatch = compareHashedData(oldPassword, user.password);
  if (!isMatch) {
    throw new AuthError("Old password is incorrect");
  }

  if (newPassword !== confirmPassword) {
    throw new AuthError("New passwords do not match");
  }

  const hashedNewPassword = await hashSensitiveData(newPassword);
  await updateUserPasswordQuery(user.id, hashedNewPassword);

  return {
    success: true,
    message: "Password updated successfully",
  };
};

export const logout = async (userId: string, device: string) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError("User does not exist", 404);
  }
  await deleteRefreshToken(user.id, device);
};
