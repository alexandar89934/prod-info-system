import { Router } from "express";

import { workplaceCategoryController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateWorkplaceCategorySchema,
  UpdateWorkplaceCategorySchema,
} from "../../shared/joi/workplaceCategory.schema";

export const workplaceCategoryRouter = Router();
workplaceCategoryRouter.use(verifyTokenMiddleware);

workplaceCategoryRouter
  .route("/create")
  .post(
    validateRequestBody(CreateWorkplaceCategorySchema),
    authorizeAdmin,
    workplaceCategoryController.createWorkplaceCategory,
  );

workplaceCategoryRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateWorkplaceCategorySchema),
    authorizeAdmin,
    workplaceCategoryController.updateWorkplaceCategory,
  );

workplaceCategoryRouter
  .route("/")
  .get(workplaceCategoryController.getAllWorkplaceCategories);

workplaceCategoryRouter
  .route("/:id")
  .get(workplaceCategoryController.getWorkplaceCategoryById);

workplaceCategoryRouter
  .route("/delete/:id")
  .delete(
    authorizeModerator,
    workplaceCategoryController.deleteWorkplaceCategory,
  );
