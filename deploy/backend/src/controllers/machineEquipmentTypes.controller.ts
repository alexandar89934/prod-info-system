import { Request, Response } from "express";
import httpStatus from "http-status";

import { machineEquipmentTypeService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createMachineEquipmentType = catchAsync(
  async (req: Request, res: Response) => {
    const typeData = req.body;
    const type =
      await machineEquipmentTypeService.createMachineEquipmentType(typeData);

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Machine Equipment Type!",
      content: { type },
    });
  },
);

export const updateMachineEquipmentType = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Equipment Type ID in request.",
      });
    }

    const typeData = { ...req.body, id: Number(id) };
    const type =
      await machineEquipmentTypeService.updateMachineEquipmentType(typeData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Machine Equipment Type!",
      content: { type },
    });
  },
);

export const getAllMachineEquipmentTypes = catchAsync(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { equipmentTypes, totalEquipmentTypes } =
      await machineEquipmentTypeService.getAllMachineEquipmentTypes(
        Number(limit),
        offset,
        String(search),
        String(sortField),
        String(sortOrder),
      );

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched Machine Equipment Types.",
      content: {
        equipmentTypes,
        pagination: {
          total: totalEquipmentTypes,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  },
);

export const getMachineEquipmentTypeById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Equipment Type ID.",
      });
    }

    const type = await machineEquipmentTypeService.getMachineEquipmentTypeById(
      Number(id),
    );

    if (!type) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Machine Equipment Type not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched Machine Equipment Type by ID.",
      content: { type },
    });
  },
);

export const deleteMachineEquipmentType = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Equipment Type ID.",
      });
    }

    const deleted =
      await machineEquipmentTypeService.deleteMachineEquipmentType(Number(id));

    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Machine Equipment Type not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Machine Equipment Type!",
      content: { deleted },
    });
  },
);
