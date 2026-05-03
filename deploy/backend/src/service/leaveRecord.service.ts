import httpStatus from "http-status";

import {
  approveLeaveRecordQuery,
  createLeaveRecordQuery,
  getAllLeaveRecordsQuery,
  getLeaveRecordByIdQuery,
  getTotalLeaveRecordsCountQuery,
} from "../models/leaveRecord.model";
import {
  getLeaveBalanceForYearQuery,
  getLeaveUsedDaysQuery,
  upsertLeaveBalanceQuery,
} from "../models/leaveBalance.model";
import { ApiError } from "../shared/error/ApiError";

import {
  ApproveLeaveRecordData,
  CreateLeaveRecordData,
  LeaveBalanceWithUsed,
  LeaveRecord,
} from "./leaveRecord.service.types";

export const createLeaveRecord = async (data: CreateLeaveRecordData): Promise<LeaveRecord> => {
  try {
    return await createLeaveRecordQuery(data);
  } catch (error) {
    throw new ApiError("Error while creating leave record!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const approveLeaveRecord = async (data: ApproveLeaveRecordData): Promise<LeaveRecord> => {
  try {
    const existing = await getLeaveRecordByIdQuery(data.id);
    if (!existing) {
      throw new ApiError("Leave record not found.", httpStatus.NOT_FOUND);
    }
    if (existing.status !== "pending") {
      throw new ApiError("Leave record has already been processed.", httpStatus.CONFLICT);
    }
    return await approveLeaveRecordQuery(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while processing leave record!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getAllLeaveRecords = async (
  limit: number,
  offset: number,
  personId: string,
  type: string,
  status: string,
  year: number,
  sortField: string,
  sortOrder: string,
): Promise<{ leaveRecords: LeaveRecord[]; total: number }> => {
  try {
    const [leaveRecords, total] = await Promise.all([
      getAllLeaveRecordsQuery(limit, offset, personId, type, status, year, sortField, sortOrder),
      getTotalLeaveRecordsCountQuery(personId, type, status, year),
    ]);
    return { leaveRecords, total };
  } catch (error) {
    throw new ApiError("Error while fetching leave records!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const getLeaveRecordById = async (id: string): Promise<LeaveRecord> => {
  const record = await getLeaveRecordByIdQuery(id);
  if (!record) {
    throw new ApiError("Leave record not found.", httpStatus.NOT_FOUND);
  }
  return record;
};

export const getLeaveBalance = async (personId: string, year: number): Promise<LeaveBalanceWithUsed> => {
  try {
    const [balance, usedData] = await Promise.all([
      getLeaveBalanceForYearQuery(personId, year),
      getLeaveUsedDaysQuery(personId, year),
    ]);

    const totalVacationDays = balance ? parseFloat(balance.totalVacationDays) : 20;
    const usedDays = usedData ? parseFloat(usedData.usedDays) : 0;

    return {
      id: balance?.id ?? "",
      personId,
      year,
      totalVacationDays: String(totalVacationDays),
      usedDays,
      remainingDays: Math.max(0, totalVacationDays - usedDays),
    };
  } catch (error) {
    throw new ApiError("Error while fetching leave balance!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const upsertLeaveBalance = async (
  personId: string,
  year: number,
  totalVacationDays: number,
): Promise<LeaveBalanceWithUsed> => {
  try {
    await upsertLeaveBalanceQuery(personId, year, totalVacationDays);
    return getLeaveBalance(personId, year);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error while updating leave balance!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};