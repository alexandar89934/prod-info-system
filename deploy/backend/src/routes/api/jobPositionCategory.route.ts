import { Router } from "express";

import { jobPositionCategoryController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateJobPositionCategorySchema,
  UpdateJobPositionCategorySchema,
} from "../../shared/joi/jobPositionCategory.schema";

export const jobPositionCategoryRouter = Router();
jobPositionCategoryRouter.use(verifyTokenMiddleware);

jobPositionCategoryRouter
  .route("/create")
  .post(
    validateRequestBody(CreateJobPositionCategorySchema),
    authorizeAdmin,
    jobPositionCategoryController.createJobPositionCategory,
  );

jobPositionCategoryRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateJobPositionCategorySchema),
    authorizeAdmin,
    jobPositionCategoryController.updateJobPositionCategory,
  );

jobPositionCategoryRouter
  .route("/")
  .get(jobPositionCategoryController.getAllJobPositionCategories);

jobPositionCategoryRouter
  .route("/:id")
  .get(jobPositionCategoryController.getJobPositionCategoryById);

jobPositionCategoryRouter
  .route("/delete/:id")
  .delete(
    authorizeModerator,
    jobPositionCategoryController.deleteJobPositionCategory,
  );