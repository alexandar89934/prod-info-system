import { Router } from "express";

import { jobPositionController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateJobPositionSchema,
  UpdateJobPositionSchema,
} from "../../shared/joi/jobPosition.schema";

export const jobPositionRouter = Router();
jobPositionRouter.use(verifyTokenMiddleware);

jobPositionRouter
  .route("/create")
  .post(
    validateRequestBody(CreateJobPositionSchema),
    authorizeAdmin,
    jobPositionController.createJobPosition,
  );

jobPositionRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateJobPositionSchema),
    authorizeAdmin,
    jobPositionController.updateJobPosition,
  );

jobPositionRouter.route("/").get(jobPositionController.getAllJobPositions);

jobPositionRouter.route("/:id").get(jobPositionController.getJobPositionById);

jobPositionRouter
  .route("/delete/:id")
  .delete(authorizeModerator, jobPositionController.deleteJobPosition);