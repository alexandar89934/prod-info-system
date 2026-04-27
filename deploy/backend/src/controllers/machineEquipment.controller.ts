import { Request, Response } from "express";
import httpStatus from "http-status";

import { machineEquipmentService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createMachineEquipment = catchAsync(
  async (req: Request, res: Response) => {
    const equipmentData = req.body;
    const equipment =
      await machineEquipmentService.createMachineEquipment(equipmentData);

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Machine Equipment!",
      content: { equipment },
    });
  },
);

export const updateMachineEquipment = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Equipment ID in request.",
      });
    }

    const equipmentData = { ...req.body, id: Number(id) };
    const equipment =
      await machineEquipmentService.updateMachineEquipment(equipmentData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Machine Equipment!",
      content: { equipment },
    });
  },
);

export const getAllMachineEquipment = catchAsync(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortField = "",
      sortOrder = "",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { equipments, totalEquipments } =
      await machineEquipmentService.getAllMachineEquipment(
        Number(limit),
        offset,
        String(search),
        String(sortField),
        String(sortOrder),
      );

    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched Machine Equipment.",
      content: {
        equipments,
        pagination: {
          total: totalEquipments,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  },
);

export const getMachineEquipmentById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Equipment ID.",
      });
    }

    const equipment = await machineEquipmentService.getMachineEquipmentById(
      Number(id),
    );

    if (!equipment) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Machine Equipment not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched Machine Equipment by ID.",
      content: { equipment },
    });
  },
);

export const getUnassignedEquipment = catchAsync(
  async (req: Request, res: Response) => {
    const { search = "" } = req.query;
    const equipments = await machineEquipmentService.getUnassignedEquipment(
      String(search),
    );
    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched unassigned equipment.",
      content: { equipments },
    });
  },
);

export const assignEquipmentToMachine = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { machineId } = req.body;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing equipment ID.",
      });
    }

    const equipment = await machineEquipmentService.assignEquipmentToMachine(
      Number(id),
      machineId,
    );

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Equipment assigned to machine successfully!",
      content: { equipment },
    });
  },
);

export const unassignEquipmentFromMachine = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing equipment ID.",
      });
    }

    const equipment =
      await machineEquipmentService.unassignEquipmentFromMachine(Number(id));

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Equipment unassigned from machine successfully!",
      content: { equipment },
    });
  },
);

export const deleteMachineEquipment = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing or invalid Machine Equipment ID.",
      });
    }

    const deleted = await machineEquipmentService.deleteMachineEquipment(
      Number(id),
    );

    if (!deleted) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Machine Equipment not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Machine Equipment!",
      content: { deleted },
    });
  },
);
