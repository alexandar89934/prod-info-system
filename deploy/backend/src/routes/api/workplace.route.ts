import { Router } from "express";

import { workplaceController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateWorkplaceSchema,
  UpdateWorkplaceSchema,
} from "../../shared/joi/workplace.schema";

export const workplaceRouter = Router();
workplaceRouter.use(verifyTokenMiddleware);

workplaceRouter
  .route("/create")
  .post(
    validateRequestBody(CreateWorkplaceSchema),
    authorizeAdmin,
    workplaceController.createWorkplace,
  );

workplaceRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateWorkplaceSchema),
    authorizeAdmin,
    workplaceController.updateWorkplace,
  );

workplaceRouter.route("/").get(workplaceController.getAllWorkplaces);

workplaceRouter.route("/:id").get(workplaceController.getWorkplaceById);

workplaceRouter
  .route("/delete/:id")
  .delete(authorizeModerator, workplaceController.deleteWorkplace);
