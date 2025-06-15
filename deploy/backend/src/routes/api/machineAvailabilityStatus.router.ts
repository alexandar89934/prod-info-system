import { Router } from "express";

import { machineAvailabilityStatusController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateMachineAvailabilityStatusSchema,
  UpdateMachineAvailabilityStatusSchema,
} from "../../shared/joi/machinaAvailabilityStatus.schema";

export const machineAvailabilityStatusRouter = Router();
machineAvailabilityStatusRouter.use(verifyTokenMiddleware);

machineAvailabilityStatusRouter
  .route("/create")
  .post(
    validateRequestBody(CreateMachineAvailabilityStatusSchema),
    authorizeAdmin,
    machineAvailabilityStatusController.createMachineAvailabilityStatus,
  );

machineAvailabilityStatusRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateMachineAvailabilityStatusSchema),
    authorizeAdmin,
    machineAvailabilityStatusController.updateMachineAvailabilityStatus,
  );

machineAvailabilityStatusRouter
  .route("/")
  .get(machineAvailabilityStatusController.getAllMachineAvailabilityStatuses);

machineAvailabilityStatusRouter
  .route("/:id")
  .get(machineAvailabilityStatusController.getMachineAvailabilityStatusById);

machineAvailabilityStatusRouter
  .route("/delete/:id")
  .delete(
    authorizeModerator,
    machineAvailabilityStatusController.deleteMachineAvailabilityStatus,
  );
