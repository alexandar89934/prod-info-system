import { Request, Response } from "express";
import httpStatus from "http-status";

import { attendanceService } from "../service";
import { getUserById } from "../service/user.service";
import { catchAsync } from "../shared/utils/CatchAsync";

const resolveEditorPersonId = async (userId: string): Promise<string> => {
  const user = await getUserById(userId);
  if (!user?.personId) {
    throw new Error("Could not resolve editor person ID.");
  }
  return user.personId;
};

export const kioskAction = catchAsync(async (req: Request, res: Response) => {
  const { rfidCardNumber, employeeNumber, pin, action } = req.body;
  const resolvedAction =
    action === "checkout" || action === "break" ? action : undefined;

  const data = rfidCardNumber
    ? { rfidCardNumber: String(rfidCardNumber), action: resolvedAction }
    : {
        employeeNumber: String(employeeNumber),
        pin: String(pin),
        action: resolvedAction,
      };

  const result = await attendanceService.kioskAction(data);

  const messages: Record<string, string> = {
    checked_in: "Check-in recorded.",
    checked_out: "Check-out recorded.",
    break_started: "Break started.",
    returned_from_break: "Returned from break.",
    choice_required: "Action required.",
    auto_closed_and_checked_in: "Previous session auto-closed. Checked in.",
  };

  return res.status(httpStatus.OK).send({
    success: true,
    message: messages[result.status] ?? "OK",
    content: result,
  });
});

export const getAllAttendances = catchAsync(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 20,
      personId = "",
      dateFrom = "",
      dateTo = "",
      sortField = "date",
      sortOrder = "DESC",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { attendances, total } = await attendanceService.getAllAttendances(
      Number(limit),
      offset,
      String(personId),
      String(dateFrom),
      String(dateTo),
      String(sortField),
      String(sortOrder),
    );

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched attendance records.",
      content: {
        attendances,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  },
);

export const getAttendanceById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing attendance ID.",
      });
    }
    const attendance = await attendanceService.getAttendanceById(id);
    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched attendance record.",
      content: { attendance },
    });
  },
);

export const getBreaksByAttendanceId = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing attendance ID.",
      });
    }
    const breaks = await attendanceService.getBreaksByAttendanceId(id);
    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched breaks.",
      content: { breaks },
    });
  },
);

export const getMonthlySummary = catchAsync(
  async (req: Request, res: Response) => {
    const { personId, year, month } = req.query;
    if (!personId || !year || !month) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "personId, year, and month are required.",
      });
    }
    const summary = await attendanceService.getMonthlySummary(
      String(personId),
      Number(year),
      Number(month),
    );
    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched monthly summary.",
      content: { summary },
    });
  },
);

export const createManualAttendance = catchAsync(
  async (req: Request, res: Response) => {
    const editorPersonId = await resolveEditorPersonId(
      res.locals.user.userId as string,
    );
    const attendance = await attendanceService.createManualAttendance(
      req.body,
      editorPersonId,
    );
    return res.status(httpStatus.CREATED).send({
      success: true,
      message: "Attendance record created successfully.",
      content: { attendance },
    });
  },
);

export const updateManualAttendance = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing attendance ID.",
      });
    }
    const editorPersonId = await resolveEditorPersonId(
      res.locals.user.userId as string,
    );
    const attendance = await attendanceService.updateManualAttendance(
      id,
      req.body,
      editorPersonId,
    );
    return res.status(httpStatus.OK).send({
      success: true,
      message: "Attendance record updated successfully.",
      content: { attendance },
    });
  },
);

export const getPendingOvertime = catchAsync(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { attendances, total } =
      await attendanceService.getPendingOvertime(Number(limit), offset);
    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched pending overtime records.",
      content: {
        attendances,
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  },
);

export const approveOvertime = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing attendance ID.",
      });
    }
    const attendance = await attendanceService.approveOvertime(id, status);
    return res.status(httpStatus.OK).send({
      success: true,
      message:
        status === "approved" ? "Overtime approved." : "Overtime rejected.",
      content: { attendance },
    });
  },
);