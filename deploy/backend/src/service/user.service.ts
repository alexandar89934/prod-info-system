import httpStatus from "http-status";

import { logger } from "#logger";

import {
  checkIfAdminQuery,
  checkIfModeratorQuery,
  getUserByIdQuery,
} from "../models/user.model";
import { ApiError } from "../shared/error/ApiError";
import { decodeJWT } from "../shared/utils/token";

export const getUserById = async (id: string) => {
  try {
    const fetchedUser = await getUserByIdQuery(id);
    if (!fetchedUser) {
      // FIXME: 404 status
      // FIXED
      throw new ApiError(
        `Error Getting User with id ${id}`,
        httpStatus.NOT_FOUND,
      );
    }
    return fetchedUser;
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Unexpected error while getting user with id ${id}`,
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const checkIfUser = async (token: string) => {
  try {
    const { userId, iat } = decodeJWT<{
      userId: string;
      iat: number;
    }>(token);
    const user = await getUserById(userId);
    if (!user) {
      return false;
    }
    return !(
      user.lastPasswordReset &&
      new Date(user.lastPasswordReset) > new Date(iat * 1000)
    );
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while checking if user is valid",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const checkIfAdmin = async (userId: string) => {
  // FIXME: Cela ova funkcija checkIfAdmin je 1 query
  // FIXED
  try {
    await getUserById(userId);
    const result = await checkIfAdminQuery(userId);
    return result[0]?.isAdmin === true;
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while checking admin privileges",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const checkIfModerator = async (userId: string) => {
  // FIXME: Isto vazi kao i za checkIfAdmin
  // FIXED
  try {
    await getUserById(userId);
    const result = await checkIfModeratorQuery(userId);
    return result[0]?.isModerator === true;
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while checking moderator privileges",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
