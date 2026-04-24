import { Request, Response } from "express";
import httpStatus from "http-status";

import { jobPositionService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createJobPosition = catchAsync(
  async (req: Request, res: Response) => {
    const jobPositionData = req.body;
    const jobPosition = await jobPositionService.createJobPosition(jobPositionData);

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Job Position!",
      content: { jobPosition },
    });
  },
);

export const updateJobPosition = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid job position ID in request.",
      });
    }

    const jobPositionData = { ...req.body, id: Number(id) };
    const jobPosition = await jobPositionService.updateJobPosition(jobPositionData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Job Position!",
      content: { jobPosition },
    });
  },
);

export const getAllJobPositions = catchAsync(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search, sortField, sortOrder } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { jobPositions, totalJobPositions } =
      await jobPositionService.getAllJobPositions(
        Number(limit),
        offset,
        String(search),
        String(sortField),
        String(sortOrder),
      );
    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched job positions.",
      content: {
        jobPositions,
        pagination: {
          total: totalJobPositions,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  },
);

export const getJobPositionById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid job position ID in request.",
      });
    }

    const jobPosition = await jobPositionService.getJobPositionById(Number(id));

    if (!jobPosition) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Job Position not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched job position by ID.",
      content: { jobPosition },
    });
  },
);

export const deleteJobPosition = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid job position ID in request.",
      });
    }

    const deleted = await jobPositionService.deleteJobPosition(Number(id));
    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Job Position not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Job Position!",
      content: { deleted },
    });
  },
);