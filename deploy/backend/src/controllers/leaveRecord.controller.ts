import { Request, Response } from "express";
import httpStatus from "http-status";

import { leaveRecordService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createLeaveRecord = catchAsync(async (req: Request, res: Response) => {
  const leaveRecord = await leaveRecordService.createLeaveRecord(req.body);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Leave record created.",
    content: { leaveRecord },
  });
});

export const approveLeaveRecord = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing leave record ID." });
  }
  const leaveRecord = await leaveRecordService.approveLeaveRecord({ ...req.body, id });
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Leave record processed.",
    content: { leaveRecord },
  });
});

export const getAllLeaveRecords = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    personId = "",
    type = "",
    status = "",
    year = 0,
    sortField = "startDate",
    sortOrder = "DESC",
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const { leaveRecords, total } = await leaveRecordService.getAllLeaveRecords(
    Number(limit),
    offset,
    String(personId),
    String(type),
    String(status),
    Number(year),
    String(sortField),
    String(sortOrder),
  );

  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched leave records.",
    content: {
      leaveRecords,
      pagination: { total, page: Number(page), limit: Number(limit) },
    },
  });
});

export const getLeaveRecordById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing leave record ID." });
  }
  const leaveRecord = await leaveRecordService.getLeaveRecordById(id);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched leave record.",
    content: { leaveRecord },
  });
});

export const getLeaveBalance = catchAsync(async (req: Request, res: Response) => {
  const { personId, year } = req.query;
  if (!personId || !year) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "personId and year are required." });
  }
  const balance = await leaveRecordService.getLeaveBalance(String(personId), Number(year));
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched leave balance.",
    content: { balance },
  });
});

export const upsertLeaveBalance = catchAsync(async (req: Request, res: Response) => {
  const { personId, year, totalVacationDays } = req.body;
  const balance = await leaveRecordService.upsertLeaveBalance(personId, Number(year), Number(totalVacationDays));
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Leave balance updated.",
    content: { balance },
  });
});