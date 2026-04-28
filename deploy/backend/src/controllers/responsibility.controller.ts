import { Request, Response } from "express";
import httpStatus from "http-status";

import { responsibilityService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllResponsibilities = catchAsync(
  async (_req: Request, res: Response) => {
    const responsibilities = await responsibilityService.getAllResponsibilities();
    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched responsibilities.",
      content: { responsibilities },
    });
  },
);

export const getResponsibilityById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid responsibility ID in request.",
      });
    }

    const responsibility = await responsibilityService.getResponsibilityById(
      Number(id),
    );

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched responsibility.",
      content: { responsibility },
    });
  },
);

export const createResponsibility = catchAsync(
  async (req: Request, res: Response) => {
    const responsibility = await responsibilityService.createResponsibility(
      req.body,
    );
    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created responsibility!",
      content: { responsibility },
    });
  },
);

export const updateResponsibility = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid responsibility ID in request.",
      });
    }

    const responsibility = await responsibilityService.updateResponsibility({
      ...req.body,
      id: Number(id),
    });

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated responsibility!",
      content: { responsibility },
    });
  },
);

export const deleteResponsibility = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid responsibility ID in request.",
      });
    }

    const deleted = await responsibilityService.deleteResponsibility(Number(id));
    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Responsibility not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted responsibility!",
      content: { deleted },
    });
  },
);