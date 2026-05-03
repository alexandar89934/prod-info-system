import httpStatus from "http-status";

import {
  applyAttendanceEditQuery,
  createAttendanceEditRequestQuery,
  getAllAttendanceEditRequestsQuery,
  getAttendanceEditRequestByIdQuery,
  getTotalAttendanceEditRequestsCountQuery,
  processAttendanceEditRequestQuery,
} from "../models/attendanceEditRequest.model";
import { getAttendanceByIdQuery } from "../models/attendance.model";
import { ApiError } from "../shared/error/ApiError";

import {
  AttendanceEditRequest,
  CreateAttendanceEditRequestData,
  ProcessAttendanceEditRequestData,
} from "./attendanceEditRequest.service.types";

export const createAttendanceEditRequest = async (
  data: CreateAttendanceEditRequestData,
): Promise<AttendanceEditRequest> => {
  try {
    const attendance = await getAttendanceByIdQuery(data.attendanceId);
    if (!attendance) {
      throw new ApiError("Attendance record not found.", httpStatus.NOT_FOUND);
    }
    return await createAttendanceEditRequestQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while creating edit request!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const processAttendanceEditRequest = async (
  data: ProcessAttendanceEditRequestData,
): Promise<AttendanceEditRequest> => {
  try {
    const request = await getAttendanceEditRequestByIdQuery(data.id);
    if (!request) {
      throw new ApiError("Edit request not found.", httpStatus.NOT_FOUND);
    }
    if (request.status !== "pending") {
      throw new ApiError("Edit request has already been processed.", httpStatus.CONFLICT);
    }

    const updated = await processAttendanceEditRequestQuery(data);

    if (data.status === "approved") {
      await applyAttendanceEditQuery(request.attendanceId, request.newValues);
    }

    return updated;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while processing edit request!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getAllAttendanceEditRequests = async (
  limit: number,
  offset: number,
  status: string,
): Promise<{ requests: AttendanceEditRequest[]; total: number }> => {
  try {
    const [requests, total] = await Promise.all([
      getAllAttendanceEditRequestsQuery(limit, offset, status),
      getTotalAttendanceEditRequestsCountQuery(status),
    ]);
    return { requests, total };
  } catch (error) {
    throw new ApiError("Error while fetching edit requests!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getAttendanceEditRequestById = async (id: string): Promise<AttendanceEditRequest> => {
  const request = await getAttendanceEditRequestByIdQuery(id);
  if (!request) {
    throw new ApiError("Edit request not found.", httpStatus.NOT_FOUND);
  }
  return request;
};