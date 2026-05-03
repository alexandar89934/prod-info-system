import httpStatus from "http-status";

import {
  approveOvertimeQuery,
  closeOpenBreakQuery,
  createAttendanceCheckInQuery,
  createBreakStartQuery,
  createManualAttendanceQuery,
  getAllAttendancesQuery,
  getAttendanceByIdQuery,
  getBreaksByAttendanceIdQuery,
  getMonthlySummaryQuery,
  getOpenAttendanceByPersonQuery,
  getOpenBreakByAttendanceQuery,
  getPendingOvertimeCountQuery,
  getPendingOvertimeQuery,
  getPersonByEmployeeNumberForKioskQuery,
  getPersonByRfidCardQuery,
  getTotalAttendancesCountQuery,
  getTotalBreakMinutesQuery,
  updateAttendanceCheckOutQuery,
  updateManualAttendanceQuery,
} from "../models/attendance.model";
import {
  getLeaveBalanceForYearQuery,
  getLeaveUsedDaysQuery,
} from "../models/leaveBalance.model";
import { getSystemConfigByKeyQuery } from "../models/systemConfig.model";
import { ApiError } from "../shared/error/ApiError";
import { compareHashedData } from "../shared/utils/hash";

import {
  Attendance,
  AttendanceBreak,
  AttendanceWithPerson,
  KioskActionData,
  KioskActionResult,
  ManualAttendanceInput,
  ManualAttendanceUpdate,
  MonthlySummary,
  PersonKioskLookup,
} from "./attendance.service.types";

const detectShiftType = (checkIn: Date): "first" | "second" | "night" => {
  const hour = checkIn.getHours();
  if (hour >= 5 && hour < 14) return "first";
  if (hour >= 14 && hour < 22) return "second";
  return "night";
};

const shiftStartHour = (shiftType: "first" | "second" | "night"): number => {
  if (shiftType === "first") return 6;
  if (shiftType === "second") return 14;
  return 22;
};

const shiftEndTime = (
  shiftType: "first" | "second" | "night",
  checkIn: Date,
): Date => {
  const end = new Date(checkIn);
  if (shiftType === "first") {
    end.setHours(14, 0, 0, 0);
  } else if (shiftType === "second") {
    end.setHours(22, 0, 0, 0);
  } else {
    // night shift ends at 06:00 the next calendar day
    end.setDate(end.getDate() + 1);
    end.setHours(6, 0, 0, 0);
  }
  return end;
};

const computeNightMinutes = (
  checkIn: Date,
  checkOut: Date,
  nightStartHour: number,
  nightEndHour: number,
): number => {
  let total = 0;
  const cursor = new Date(checkIn);
  const end = new Date(checkOut);

  while (cursor < end) {
    const hour = cursor.getHours();
    const isNight =
      nightStartHour > nightEndHour
        ? hour >= nightStartHour || hour < nightEndHour
        : hour >= nightStartHour && hour < nightEndHour;

    if (isNight) total += 1;
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return total;
};

type ShiftConfig = {
  standardWorkMinutes: number;
  nightStart: number;
  nightEnd: number;
  gracePeriodMinutes: number;
  overtimeMinimumMinutes: number;
  standardBreakMinutes: number;
};

type AttendanceStats = {
  shiftType: "first" | "second" | "night";
  workMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  nightMinutes: number;
  weekendMinutes: number;
  overtimeStatus: "pending" | null;
};

const fetchShiftConfig = async (): Promise<ShiftConfig> => {
  const [stdCfg, nightStartCfg, nightEndCfg, graceCfg, overtimeMinCfg, breakCfg] =
    await Promise.all([
      getSystemConfigByKeyQuery("standardWorkMinutes"),
      getSystemConfigByKeyQuery("nightStartHour"),
      getSystemConfigByKeyQuery("nightEndHour"),
      getSystemConfigByKeyQuery("shiftGracePeriodMinutes"),
      getSystemConfigByKeyQuery("overtimeMinimumMinutes"),
      getSystemConfigByKeyQuery("standardBreakMinutes"),
    ]);
  return {
    standardWorkMinutes: parseInt(stdCfg?.value ?? "480", 10),
    nightStart: parseInt(nightStartCfg?.value ?? "22", 10),
    nightEnd: parseInt(nightEndCfg?.value ?? "6", 10),
    gracePeriodMinutes: parseInt(graceCfg?.value ?? "15", 10),
    overtimeMinimumMinutes: parseInt(overtimeMinCfg?.value ?? "40", 10),
    standardBreakMinutes: parseInt(breakCfg?.value ?? "40", 10),
  };
};

const computeAttendanceStats = (
  checkIn: Date,
  checkOut: Date,
  totalBreakMinutes: number,
  cfg: ShiftConfig,
  shiftTypeOverride?: "first" | "second" | "night",
): AttendanceStats => {
  const shiftType = shiftTypeOverride ?? detectShiftType(checkIn);
  const startHour = shiftStartHour(shiftType);
  const shiftStart = new Date(checkIn);
  shiftStart.setHours(startHour, 0, 0, 0);

  const shiftEnd = shiftEndTime(shiftType, checkIn);

  const minutesEarly = checkIn < shiftStart
    ? Math.round((shiftStart.getTime() - checkIn.getTime()) / 60000)
    : 0;
  const minutesLateCheckout = checkOut > shiftEnd
    ? Math.round((checkOut.getTime() - shiftEnd.getTime()) / 60000)
    : 0;

  let effectiveCheckIn = checkIn;
  if (minutesEarly > 0 && minutesEarly <= cfg.gracePeriodMinutes && minutesLateCheckout <= cfg.gracePeriodMinutes) {
    effectiveCheckIn = shiftStart;
  }

  let effectiveCheckOut = checkOut;
  if (minutesLateCheckout > 0 && minutesLateCheckout <= cfg.gracePeriodMinutes) {
    effectiveCheckOut = shiftEnd;
  }

  const rawWorkMinutes = Math.round((effectiveCheckOut.getTime() - effectiveCheckIn.getTime()) / 60000);
  const trimApplies =
    rawWorkMinutes > cfg.standardWorkMinutes &&
    rawWorkMinutes - cfg.standardBreakMinutes <= cfg.standardWorkMinutes;
  const mandatoryBreak = trimApplies ? cfg.standardBreakMinutes : 0;
  const breakDeduction = Math.max(totalBreakMinutes, mandatoryBreak);
  const workMinutes = Math.max(0, rawWorkMinutes - breakDeduction);
  const isWeekend = effectiveCheckIn.getDay() === 0 || effectiveCheckIn.getDay() === 6;
  const weekendMinutes = isWeekend ? workMinutes : 0;
  const rawNightMinutes = computeNightMinutes(effectiveCheckIn, effectiveCheckOut, cfg.nightStart, cfg.nightEnd);
  // break deduction absorbs non-standard time (early arrival / late checkout) which is where
  // night minutes typically accumulate for non-night-shift workers
  const nightMinutes = Math.max(0, rawNightMinutes - breakDeduction);
  const overtimeMinutes = Math.max(0, workMinutes - cfg.standardWorkMinutes);
  const regularMinutes = Math.max(0, workMinutes - overtimeMinutes - nightMinutes);
  const overtimeStatus = overtimeMinutes >= cfg.overtimeMinimumMinutes ? "pending" : null;

  return { shiftType, workMinutes, regularMinutes, overtimeMinutes, nightMinutes, weekendMinutes, overtimeStatus };
};

const checkoutSession = async (
  sessionId: string,
  checkIn: Date,
  checkOut: Date,
  cfg: ShiftConfig,
  options: { note?: string; systemClosed?: boolean } = {},
): Promise<Attendance> => {
  const totalBreakMinutes = await getTotalBreakMinutesQuery(sessionId);
  const stats = computeAttendanceStats(checkIn, checkOut, totalBreakMinutes, cfg);

  return updateAttendanceCheckOutQuery(
    sessionId,
    checkOut,
    stats.workMinutes,
    stats.regularMinutes,
    stats.overtimeMinutes,
    stats.nightMinutes,
    stats.weekendMinutes,
    options.note ?? null,
    stats.overtimeStatus,
    options.systemClosed ?? false,
  );
};

export const kioskAction = async (
  data: KioskActionData,
): Promise<KioskActionResult> => {
  let person: PersonKioskLookup | null = null;

  if ("rfidCardNumber" in data && data.rfidCardNumber) {
    person = await getPersonByRfidCardQuery(data.rfidCardNumber);
    if (!person) {
      throw new ApiError("RFID card not recognized.", httpStatus.UNAUTHORIZED);
    }
  } else {
    const { employeeNumber, pin } = data as {
      employeeNumber: string;
      pin: string;
    };
    const found = await getPersonByEmployeeNumberForKioskQuery(employeeNumber);
    if (!found) {
      throw new ApiError("Employee not found.", httpStatus.UNAUTHORIZED);
    }
    if (!found.pin) {
      throw new ApiError(
        "PIN not set for this employee.",
        httpStatus.UNAUTHORIZED,
      );
    }
    const pinMatch = await compareHashedData(pin, found.pin);
    if (!pinMatch) {
      throw new ApiError("Incorrect PIN.", httpStatus.UNAUTHORIZED);
    }
    person = found;
  }

  const now = new Date();
  const requestedAction = (data as { action?: string }).action;
  const openSession = await getOpenAttendanceByPersonQuery(person.id);

  if (!openSession) {
    const shiftType = detectShiftType(now);
    const attendance = await createAttendanceCheckInQuery(
      person.id,
      now,
      shiftType,
    );
    return { status: "checked_in", personName: person.name, time: now, attendance };
  }

  const checkInTime = new Date(openSession.checkIn);
  const minutesSinceCheckIn = Math.round(
    (now.getTime() - checkInTime.getTime()) / 60000,
  );

  const cfg = await fetchShiftConfig();

  const maxShiftCfg = await getSystemConfigByKeyQuery("maxShiftMinutes");
  const maxShiftMinutes = parseInt(maxShiftCfg?.value ?? "1080", 10);

  // Stale session: open longer than maxShiftMinutes → auto-close then check in
  if (minutesSinceCheckIn > maxShiftMinutes) {
    const autoCheckOut = new Date(
      checkInTime.getTime() + cfg.standardWorkMinutes * 60000,
    );

    const staleOpenBreak = await getOpenBreakByAttendanceQuery(openSession.id);
    if (staleOpenBreak) {
      await closeOpenBreakQuery(openSession.id, autoCheckOut);
    }

    await checkoutSession(openSession.id, checkInTime, autoCheckOut, cfg, {
      systemClosed: true,
    });

    const shiftType = detectShiftType(now);
    const attendance = await createAttendanceCheckInQuery(
      person.id,
      now,
      shiftType,
    );
    return {
      status: "auto_closed_and_checked_in",
      personName: person.name,
      time: now,
      attendance,
    };
  }

  const openBreak = await getOpenBreakByAttendanceQuery(openSession.id);

  if (openBreak) {
    await closeOpenBreakQuery(openSession.id, now);
    return { status: "returned_from_break", personName: person.name, time: now };
  }

  if (requestedAction === "break") {
    await createBreakStartQuery(openSession.id, now);
    return { status: "break_started", personName: person.name, time: now };
  }

  if (!requestedAction) {
    return { status: "choice_required", personName: person.name };
  }

  const attendance = await checkoutSession(
    openSession.id,
    checkInTime,
    now,
    cfg,
  );
  return { status: "checked_out", personName: person.name, time: now, attendance };
};

export const getAllAttendances = async (
  limit: number,
  offset: number,
  personId: string,
  dateFrom: string,
  dateTo: string,
  sortField: string,
  sortOrder: string,
): Promise<{ attendances: AttendanceWithPerson[]; total: number }> => {
  try {
    const [attendances, total] = await Promise.all([
      getAllAttendancesQuery(
        limit,
        offset,
        personId,
        dateFrom,
        dateTo,
        sortField,
        sortOrder,
      ),
      getTotalAttendancesCountQuery(personId, dateFrom, dateTo),
    ]);
    return { attendances, total };
  } catch (error) {
    throw new ApiError(
      "Error while fetching attendance records!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getAttendanceById = async (
  id: string,
): Promise<AttendanceWithPerson> => {
  const record = await getAttendanceByIdQuery(id);
  if (!record) {
    throw new ApiError("Attendance record not found.", httpStatus.NOT_FOUND);
  }
  return record;
};

export const getMonthlySummary = async (
  personId: string,
  year: number,
  month: number,
): Promise<MonthlySummary> => {
  try {
    const [summary, leaveRows] = await Promise.all([
      getMonthlySummaryQuery(personId, year, month),
      getLeaveUsedDaysQuery(personId, year),
    ]);

    const leaveBalance = await getLeaveBalanceForYearQuery(personId, year);
    const totalVacationDays = leaveBalance
      ? parseFloat(leaveBalance.totalVacationDays)
      : 20;
    const vacationDaysUsed = leaveRows ? parseFloat(leaveRows.usedDays) : 0;

    return {
      totalWorkingDays: Number(summary?.totalWorkingDays ?? 0),
      totalWorkMinutes: Number(summary?.totalWorkMinutes ?? 0),
      totalOvertimeMinutes: Number(summary?.totalOvertimeMinutes ?? 0),
      totalNightMinutes: Number(summary?.totalNightMinutes ?? 0),
      totalWeekendMinutes: Number(summary?.totalWeekendMinutes ?? 0),
      vacationDaysUsed,
      vacationDaysRemaining: Math.max(0, totalVacationDays - vacationDaysUsed),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Error while fetching monthly summary!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getBreaksByAttendanceId = async (
  attendanceId: string,
): Promise<AttendanceBreak[]> => {
  const attendance = await getAttendanceByIdQuery(attendanceId);
  if (!attendance) {
    throw new ApiError("Attendance record not found.", httpStatus.NOT_FOUND);
  }
  return getBreaksByAttendanceIdQuery(attendanceId);
};

export const createManualAttendance = async (
  input: ManualAttendanceInput,
  editorPersonId: string,
): Promise<Attendance> => {
  const shiftType = input.shiftType ?? detectShiftType(new Date(input.checkIn));
  const record = await createManualAttendanceQuery(
    input.personId,
    input.date,
    input.checkIn,
    input.checkOut ?? null,
    shiftType,
    input.note ?? null,
    editorPersonId,
  );

  if (input.checkOut) {
    const cfg = await fetchShiftConfig();
    const stats = computeAttendanceStats(new Date(input.checkIn), new Date(input.checkOut), 0, cfg, input.shiftType ?? undefined);
    return updateManualAttendanceQuery(record.id, {
      shiftType: stats.shiftType,
      workMinutes: stats.workMinutes,
      regularMinutes: stats.regularMinutes,
      overtimeMinutes: stats.overtimeMinutes,
      nightMinutes: stats.nightMinutes,
      weekendMinutes: stats.weekendMinutes,
      overtimeStatus: stats.overtimeStatus,
    }, editorPersonId);
  }

  return record;
};

export const updateManualAttendance = async (
  id: string,
  update: ManualAttendanceUpdate,
  editorPersonId: string,
): Promise<Attendance> => {
  const record = await getAttendanceByIdQuery(id);
  if (!record) {
    throw new ApiError("Attendance record not found.", httpStatus.NOT_FOUND);
  }

  const finalCheckIn = update.checkIn ? new Date(update.checkIn) : new Date(record.checkIn);
  const finalCheckOut = update.checkOut
    ? new Date(update.checkOut)
    : record.checkOut ? new Date(record.checkOut) : null;

  // keep date column in sync with checkIn date when checkIn is changed
  if (update.checkIn) {
    update.date = update.checkIn.slice(0, 10);
  }

  let statsUpdate: Partial<ManualAttendanceUpdate> = {};
  if (finalCheckOut) {
    const [cfg, totalBreakMinutes] = await Promise.all([
      fetchShiftConfig(),
      getTotalBreakMinutesQuery(id),
    ]);
    const shiftTypeOverride = (update.shiftType ?? record.shiftType) as "first" | "second" | "night" | undefined;
    const stats = computeAttendanceStats(finalCheckIn, finalCheckOut, totalBreakMinutes, cfg, shiftTypeOverride ?? undefined);
    statsUpdate = {
      shiftType: stats.shiftType,
      workMinutes: stats.workMinutes,
      regularMinutes: stats.regularMinutes,
      overtimeMinutes: stats.overtimeMinutes,
      nightMinutes: stats.nightMinutes,
      weekendMinutes: stats.weekendMinutes,
      overtimeStatus: stats.overtimeStatus,
    };
  }

  return updateManualAttendanceQuery(id, { ...update, ...statsUpdate }, editorPersonId);
};

export const getPendingOvertime = async (
  limit: number,
  offset: number,
): Promise<{ attendances: AttendanceWithPerson[]; total: number }> => {
  const [attendances, total] = await Promise.all([
    getPendingOvertimeQuery(limit, offset),
    getPendingOvertimeCountQuery(),
  ]);
  return { attendances, total };
};

export const approveOvertime = async (
  id: string,
  status: "approved" | "rejected",
): Promise<AttendanceWithPerson> => {
  const record = await getAttendanceByIdQuery(id);
  if (!record) {
    throw new ApiError("Attendance record not found.", httpStatus.NOT_FOUND);
  }
  if (record.overtimeStatus !== "pending") {
    throw new ApiError(
      "This record does not have pending overtime.",
      httpStatus.BAD_REQUEST,
    );
  }
  return approveOvertimeQuery(id, status);
};