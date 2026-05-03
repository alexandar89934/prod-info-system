import { Router } from "express";

import { attendanceController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeManualAttendanceEntry,
  authorizeManualAttendanceUpdate,
  authorizeOvertimeApproval,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  KioskActionSchema,
  ManualAttendanceCreateSchema,
  ManualAttendanceUpdateSchema,
  OvertimeApprovalSchema,
} from "../../shared/joi/attendance.schema";

export const attendanceRouter = Router();

attendanceRouter
  .route("/kiosk")
  .post(
    validateRequestBody(KioskActionSchema),
    attendanceController.kioskAction,
  );

attendanceRouter.use(verifyTokenMiddleware);

attendanceRouter.route("/").get(attendanceController.getAllAttendances);

attendanceRouter.route("/summary").get(attendanceController.getMonthlySummary);

attendanceRouter
  .route("/manual")
  .post(
    authorizeManualAttendanceEntry,
    validateRequestBody(ManualAttendanceCreateSchema),
    attendanceController.createManualAttendance,
  );

attendanceRouter
  .route("/overtime/pending")
  .get(authorizeOvertimeApproval, attendanceController.getPendingOvertime);

attendanceRouter
  .route("/overtime/approve/:id")
  .put(
    authorizeOvertimeApproval,
    validateRequestBody(OvertimeApprovalSchema),
    attendanceController.approveOvertime,
  );

attendanceRouter.route("/:id/breaks").get(attendanceController.getBreaksByAttendanceId);

attendanceRouter.route("/:id").get(attendanceController.getAttendanceById);

attendanceRouter
  .route("/update/:id")
  .put(
    authorizeManualAttendanceUpdate,
    validateRequestBody(ManualAttendanceUpdateSchema),
    attendanceController.updateManualAttendance,
  );