import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

import { config } from "../config/config";
import {
  checkUserHasResponsibilityQuery,
  getUserByIdentifier,
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
    Object.assign(res.locals, { user: tryExtractTokenFromHeaders(req) });
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
    Object.assign(res.locals, { user: tryExtractTokenFromHeaders(req) });
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
    Object.assign(res.locals, { user: tryExtractTokenFromHeaders(req) });
    const { userId } = res.locals.user;
    const user = await getUserById(userId);
    const { employeeNumber: targetEmployeeNumber } = req.body;
    const targetUser = await getUserByIdentifier(user.employeeNumber);
    const { roles: newRoles } = req.body;

    const userRoles = await getUserRolesById(targetUser.id);
    const currentUserRoles = userRoles
      ? userRoles.map((row) => row.roleId)
      : [];

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
    Object.assign(res.locals, { user: tryExtractTokenFromHeaders(req) });
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

const makeResponsibilityMiddleware = (code: string, errorMessage: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      Object.assign(res.locals, { user: tryExtractTokenFromHeaders(req) });
      const result = await checkUserHasResponsibilityQuery(res.locals.user.userId, code);
      if (!result?.[0]?.hasIt) {
        res.status(httpStatus.FORBIDDEN).send({ success: false, message: errorMessage });
        return;
      }
      next();
    } catch (error) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: (error as Error).message });
    }
  };

export const authorizeOrderCreator = makeResponsibilityMiddleware(
  "kreiranje_naloga",
  "Nemate nadležnost za kreiranje kupovnog naloga.",
);

export const authorizeOrderEditor = makeResponsibilityMiddleware(
  "izmena_naloga",
  "Nemate nadležnost za izmenu kupovnog naloga.",
);

export const authorizePlanCreator = makeResponsibilityMiddleware(
  "kreiranje_plana",
  "Nemate nadležnost za kreiranje plana proizvodnje.",
);

export const authorizePlanEditor = makeResponsibilityMiddleware(
  "izmena_plana",
  "Nemate nadležnost za izmenu plana proizvodnje.",
);

export const authorizePlanDeleter = makeResponsibilityMiddleware(
  "brisanje_plana",
  "Nemate nadležnost za brisanje plana proizvodnje.",
);

export const authorizeVacationApprover = makeResponsibilityMiddleware(
  "odobrenje_odmora",
  "Nemate nadležnost za odobrenje odmora.",
);

export const authorizeAttendanceEditor = makeResponsibilityMiddleware(
  "izmena_prisustva",
  "Nemate nadležnost za izmenu evidencije prisustva.",
);

export const authorizeAttendanceEditApprover = makeResponsibilityMiddleware(
  "odobrenje_izmene_prisustva",
  "Nemate nadležnost za odobrenje izmene prisustva.",
);

export const authorizeOvertimeApproval = makeResponsibilityMiddleware(
  "odobrenje_prekovremenog",
  "Nemate nadležnost za odobrenje prekovremenog rada.",
);

export const authorizeManualAttendanceEntry = makeResponsibilityMiddleware(
  "rucni_unos_prisustva",
  "Nemate nadležnost za ručni unos prisustva.",
);

export const authorizeManualAttendanceUpdate = makeResponsibilityMiddleware(
  "rucna_izmena_prisustva",
  "Nemate nadležnost za ručnu izmenu prisustva.",
);

export const authorizeTeamAttendanceViewer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    Object.assign(res.locals, { user: tryExtractTokenFromHeaders(req) });
    const userId = res.locals.user.userId;
    const [hasTeam, hasAll] = await Promise.all([
      checkUserHasResponsibilityQuery(userId, "pregled_prisustva_tima"),
      checkUserHasResponsibilityQuery(userId, "pregled_svih_prisustva"),
    ]);
    if (!hasTeam?.[0]?.hasIt && !hasAll?.[0]?.hasIt) {
      res.status(httpStatus.FORBIDDEN).send({
        success: false,
        message: "Nemate nadležnost za pregled evidencije prisustva.",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: (error as Error).message });
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
  } catch (ex: unknown) {
    if ((ex as Error).name === "TokenExpiredError") {
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
    return;
  }
  try {
    const isValidUSer = await checkIfUser(token);
    if (!isValidUSer) {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        message: "Token not valid for user.",
      });
      return;
    }
    next();
  } catch (ex: unknown) {
    res.status(httpStatus.UNAUTHORIZED).clearCookie("refreshToken").send({
      success: false,
      message: "Session expired, please log in again.",
      tokenNotValid: true,
    });
  }
};
