import { Router } from "express";

import { signInController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  ResetPasswordSchema,
  SetKioskPinSchema,
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

signInRouter
  .route("/user/set-pin")
  .put(
    verifyTokenMiddleware,
    validateRequestBody(SetKioskPinSchema),
    signInController.setKioskPin,
  );
