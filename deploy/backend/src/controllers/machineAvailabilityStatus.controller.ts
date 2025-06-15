import { Request, Response } from "express";
import httpStatus from "http-status";

import { machineAvailabilityStatusService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createMachineAvailabilityStatus = catchAsync(
  async (req: Request, res: Response) => {
    const statusData = req.body;
    const status =
      await machineAvailabilityStatusService.createMachineAvailabilityStatus(
        statusData,
      );

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Machine Availability Status!",
      content: { status },
    });
  },
);

export const updateMachineAvailabilityStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message:
          "Missing or invalid Machine Availability Status ID in request.",
      });
    }

    const statusData = { ...req.body, id: Number(id) };
    const status =
      await machineAvailabilityStatusService.updateMachineAvailabilityStatus(
        statusData,
      );

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Machine Availability Status!",
      content: { status },
    });
  },
);

export const getAllMachineAvailabilityStatuses = catchAsync(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { statuses, totalStatuses } =
      await machineAvailabilityStatusService.getAllMachineAvailabilityStatuses(
        Number(limit),
        offset,
        String(search),
        String(sortField),
        String(sortOrder),
      );

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched Machine Availability Statuses.",
      content: {
        statuses,
        pagination: {
          total: totalStatuses,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  },
);

export const getMachineAvailabilityStatusById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Availability Status ID.",
      });
    }

    const status =
      await machineAvailabilityStatusService.getMachineAvailabilityStatusById(
        Number(id),
      );

    if (!status) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Machine Availability Status not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched Machine Availability Status by ID.",
      content: { status },
    });
  },
);

export const deleteMachineAvailabilityStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Availability Status ID.",
      });
    }

    const deleted =
      await machineAvailabilityStatusService.deleteMachineAvailabilityStatus(
        Number(id),
      );

    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Machine Availability Status not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Machine Availability Status!",
      content: { deleted },
    });
  },
);
