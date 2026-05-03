import { Router } from "express";

import { attendanceEditRequestController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  CreateAttendanceEditRequestSchema,
  ProcessAttendanceEditRequestSchema,
} from "../../shared/joi/attendanceEditRequest.schema";

export const attendanceEditRequestRouter = Router();
attendanceEditRequestRouter.use(verifyTokenMiddleware);

attendanceEditRequestRouter.route("/").get(attendanceEditRequestController.getAllAttendanceEditRequests);

attendanceEditRequestRouter
  .route("/create")
  .post(
    validateRequestBody(CreateAttendanceEditRequestSchema),
    attendanceEditRequestController.createAttendanceEditRequest,
  );

attendanceEditRequestRouter.route("/:id").get(attendanceEditRequestController.getAttendanceEditRequestById);

attendanceEditRequestRouter
  .route("/process/:id")
  .put(
    validateRequestBody(ProcessAttendanceEditRequestSchema),
    attendanceEditRequestController.processAttendanceEditRequest,
  );