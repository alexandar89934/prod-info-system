import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

import { config } from "../config/config";
import {
  getUserByEmployeeNumber,
  getUserRolesById,
} from "../models/user.model";
import { getPersonByEmployeeNumber } from "../service/person.service";
import {
  checkIfAdmin,
  checkIfModerator,
  checkIfUser,
  getUserById,
} from "../service/user.service";
import { tryExtractTokenFromHeaders } from "../shared/utils/token";

export const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line no-param-reassign
    res.locals.user = tryExtractTokenFromHeaders(req);
    const isAdmin = await checkIfAdmin(res.locals.user.userId);
    if (!isAdmin) {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        message: "This action requires administrator role.",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const authorizeSelf = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line no-param-reassign
    res.locals.user = tryExtractTokenFromHeaders(req);
    const { userId } = res.locals.user;
    const user = await getUserById(userId);
    const person = await getPersonByEmployeeNumber(user.employeeNumber);
    const targetUserId = req.params.id;

    if (person?.id === targetUserId) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "You cannot perform this action on yourself.",
      });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const authorizeAdminOrSelf = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line no-param-reassign
    res.locals.user = tryExtractTokenFromHeaders(req);
    const { userId } = res.locals.user;
    const user = await getUserById(userId);
    const { employeeNumber: targetEmployeeNumber } = req.body; // Target employee number to be updated
    const targetUser = await getUserByEmployeeNumber(targetEmployeeNumber);
    const { roles: newRoles } = req.body;

    const currentUserRoles = await getUserRolesById(targetUser.id);

    const isChangingRoles =
      newRoles &&
      JSON.stringify(newRoles.sort()) !==
        JSON.stringify(currentUserRoles.sort());

    if (user.employeeNumber === targetEmployeeNumber) {
      if (isChangingRoles && !(await checkIfAdmin(userId))) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: "You are not allowed to change roles.",
        });
      }
      return next();
    }
    const isAdmin = await checkIfAdmin(userId);
    if (isAdmin) {
      return next();
    }
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "You are not authorized to perform this action.",
    });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export const authorizeModerator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line no-param-reassign
    res.locals.user = tryExtractTokenFromHeaders(req);
    const isModerator = await checkIfModerator(res.locals.user.userId);
    if (!isModerator) {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        message: "This action requires Moderator role.",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const verifyTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header("token");
  if (!token) {
    res.status(httpStatus.FORBIDDEN).send({
      success: false,
      message: "Token not provided, Please Login.",
    });
    return;
  }

  try {
    jwt.verify(token, config.jwt.secret);
    const isValidUSer = await checkIfUser(token);
    if (!isValidUSer) {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        message: "Token not valid for user.",
      });
      return;
    }
    next();
  } catch (ex: any) {
    if (ex.name === "TokenExpiredError") {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        message: "Token expired, Please Login.",
        tokenExpired: true,
      });
      return;
    }
    res.status(httpStatus.UNAUTHORIZED).clearCookie("refreshToken").send({
      success: false,
      message: "Token not valid.",
      tokenNotValid: true,
    });
  }
};
