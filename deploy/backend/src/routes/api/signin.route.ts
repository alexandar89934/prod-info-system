import { Router } from "express";

import { signInController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { AdminLoginSchema } from "../../shared/joi/user.schema";

export const signInRouter = Router();

signInRouter
  .route("/admin")
  .post(validateRequestBody(AdminLoginSchema), signInController.adminSignIn);
