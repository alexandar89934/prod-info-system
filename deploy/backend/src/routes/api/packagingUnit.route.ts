import { Router } from "express";

import { packagingUnitController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreatePackagingUnitSchema,
  UpdatePackagingUnitSchema,
} from "../../shared/joi/packagingUnit.schema";

export const packagingUnitRouter = Router();

packagingUnitRouter.use(verifyTokenMiddleware);

packagingUnitRouter
  .route("/")
  .get(packagingUnitController.getAllPackagingUnits);
packagingUnitRouter
  .route("/create")
  .post(
    validateRequestBody(CreatePackagingUnitSchema),
    authorizeAdmin,
    packagingUnitController.createPackagingUnit,
  );
packagingUnitRouter
  .route("/:id")
  .get(packagingUnitController.getPackagingUnitById);
packagingUnitRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdatePackagingUnitSchema),
    authorizeAdmin,
    packagingUnitController.updatePackagingUnit,
  );
packagingUnitRouter
  .route("/delete/:id")
  .delete(authorizeModerator, packagingUnitController.deletePackagingUnit);
