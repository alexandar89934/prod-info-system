import { Router } from "express";

import { leaveRecordController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  ApproveLeaveRecordSchema,
  CreateLeaveRecordSchema,
  UpsertLeaveBalanceSchema,
} from "../../shared/joi/leaveRecord.schema";

export const leaveRecordRouter = Router();
leaveRecordRouter.use(verifyTokenMiddleware);

leaveRecordRouter.route("/").get(leaveRecordController.getAllLeaveRecords);

leaveRecordRouter.route("/balance").get(leaveRecordController.getLeaveBalance);

leaveRecordRouter
  .route("/balance/upsert")
  .post(validateRequestBody(UpsertLeaveBalanceSchema), leaveRecordController.upsertLeaveBalance);

leaveRecordRouter
  .route("/create")
  .post(validateRequestBody(CreateLeaveRecordSchema), leaveRecordController.createLeaveRecord);

leaveRecordRouter.route("/:id").get(leaveRecordController.getLeaveRecordById);

leaveRecordRouter
  .route("/approve/:id")
  .put(validateRequestBody(ApproveLeaveRecordSchema), leaveRecordController.approveLeaveRecord);