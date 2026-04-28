import { Router } from "express";

import { responsibilityController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateResponsibilitySchema,
  UpdateResponsibilitySchema,
} from "../../shared/joi/responsibility.schema";

export const responsibilityRouter = Router();
responsibilityRouter.use(verifyTokenMiddleware);

responsibilityRouter
  .route("/create")
  .post(
    validateRequestBody(CreateResponsibilitySchema),
    authorizeAdmin,
    responsibilityController.createResponsibility,
  );

responsibilityRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateResponsibilitySchema),
    authorizeAdmin,
    responsibilityController.updateResponsibility,
  );

responsibilityRouter.route("/").get(responsibilityController.getAllResponsibilities);

responsibilityRouter
  .route("/:id")
  .get(responsibilityController.getResponsibilityById);

responsibilityRouter
  .route("/delete/:id")
  .delete(authorizeAdmin, responsibilityController.deleteResponsibility);