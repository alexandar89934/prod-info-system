import { Request, Response } from "express";
import httpStatus from "http-status";

import { attendanceEditRequestService } from "../service";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createAttendanceEditRequest = catchAsync(async (req: Request, res: Response) => {
  const request = await attendanceEditRequestService.createAttendanceEditRequest(req.body);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Edit request submitted.",
    content: { request },
  });
});

export const processAttendanceEditRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing request ID." });
  }
  const request = await attendanceEditRequestService.processAttendanceEditRequest({ ...req.body, id });
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Edit request processed.",
    content: { request },
  });
});

export const getAllAttendanceEditRequests = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status = "" } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { requests, total } = await attendanceEditRequestService.getAllAttendanceEditRequests(
    Number(limit),
    offset,
    String(status),
  );

  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched edit requests.",
    content: {
      requests,
      pagination: { total, page: Number(page), limit: Number(limit) },
    },
  });
});

export const getAttendanceEditRequestById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(httpStatus.BAD_REQUEST).send({ success: false, message: "Missing request ID." });
  }
  const request = await attendanceEditRequestService.getAttendanceEditRequestById(id);
  return res.status(httpStatus.OK).send({
    success: true,
    message: "Successfully fetched edit request.",
    content: { request },
  });
});