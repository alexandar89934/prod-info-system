import { Router } from "express";

import { machineKioskController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { VerifyKioskAccessSchema } from "../../shared/joi/machineKiosk.schema";

export const machineKioskRouter = Router();

machineKioskRouter
  .route("/verify-access")
  .post(validateRequestBody(VerifyKioskAccessSchema), machineKioskController.verifyKioskAccess);