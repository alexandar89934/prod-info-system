import { Request, Response } from "express";
import httpStatus from "http-status";

import { machineService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const getAllMachines = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortField = "",
    sortOrder = "",
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const { machines, totalMachines } = await machineService.getAllMachines(
    Number(limit),
    offset,
    String(search),
    String(sortField),
    String(sortOrder),
  );

  res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched machines.",
    content: {
      machines,
      pagination: {
        total: totalMachines,
        page: Number(page),
        limit: Number(limit),
      },
    },
  });
});

export const getMachineById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "Missing or invalid machine ID.",
    });
  }

  const machine = await machineService.getMachineById(id);

  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched machine by ID.",
    content: { machine },
  });
});

export const createMachine = catchAsync(async (req: Request, res: Response) => {
  const machine = await machineService.createMachine(req.body);

  res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully created machine!",
    content: { machine },
  });
});

export const updateMachine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "Missing or invalid machine ID in request.",
    });
  }

  const machine = await machineService.updateMachine({ ...req.body, id });

  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully updated machine!",
    content: { machine },
  });
});

export const deleteMachine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: "Missing or invalid machine ID.",
    });
  }

  const deleted = await machineService.deleteMachine(id);

  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully deleted machine!",
    content: { deleted },
  });
});