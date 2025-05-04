import { Router } from "express";

import { signInController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  ResetPasswordSchema,
  UserLoginSchema,
} from "../../shared/joi/user.schema";

export const signInRouter = Router();

signInRouter
  .route("/user")
  .post(validateRequestBody(UserLoginSchema), signInController.userSignIn);

signInRouter
  .route("/user/reset-password")
  .post(
    validateRequestBody(ResetPasswordSchema),
    signInController.resetPassword,
  );

signInRouter.route("/user/renew-token").post(signInController.renewAccessToken);

signInRouter.route("/user/logout").post(signInController.userLogout);
