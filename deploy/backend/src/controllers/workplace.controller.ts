import { Request, Response } from "express";
import httpStatus from "http-status";

import { workplaceService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createWorkplace = catchAsync(
  async (req: Request, res: Response) => {
    const workplaceData = req.body;
    const workplace = await workplaceService.createWorkplace(workplaceData);

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Workplace!",
      content: { workplace },
    });
  },
);

export const updateWorkplace = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid workplace ID in request.",
      });
    }

    const workplaceData = { ...req.body, id: Number(id) };
    const workplace = await workplaceService.updateWorkplace(workplaceData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Workplace!",
      content: { workplace },
    });
  },
);

export const getAllWorkplaces = catchAsync(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search, sortField, sortOrder } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { workplaces, totalWorkplaces } =
      await workplaceService.getAllWorkplaces(
        Number(limit),
        offset,
        String(search),
        String(sortField),
        String(sortOrder),
      );
    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched workplaces.",
      content: {
        workplaces,
        pagination: {
          total: totalWorkplaces,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  },
);

export const getWorkplaceById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid workplace ID in request.",
      });
    }

    const workplace = await workplaceService.getWorkplaceById(Number(id));

    if (!workplace) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Workplace not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched workplace by ID.",
      content: { workplace },
    });
  },
);

export const deleteWorkplace = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid workplace ID in request.",
      });
    }

    const deleted = await workplaceService.deleteWorkplace(Number(id));
    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Workplace not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Workplace!",
      content: { deleted },
    });
  },
);
