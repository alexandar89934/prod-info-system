import { Router } from "express";

import { machineEquipmentTypesController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateMachineEquipmentTypeSchema,
  UpdateMachineEquipmentTypeSchema,
} from "../../shared/joi/machineEquipmentType.schema";

export const machineEquipmentTypeRouter = Router();
machineEquipmentTypeRouter.use(verifyTokenMiddleware);

machineEquipmentTypeRouter
  .route("/create")
  .post(
    validateRequestBody(CreateMachineEquipmentTypeSchema),
    authorizeAdmin,
    machineEquipmentTypesController.createMachineEquipmentType,
  );

machineEquipmentTypeRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateMachineEquipmentTypeSchema),
    authorizeAdmin,
    machineEquipmentTypesController.updateMachineEquipmentType,
  );

machineEquipmentTypeRouter
  .route("/")
  .get(machineEquipmentTypesController.getAllMachineEquipmentTypes);

machineEquipmentTypeRouter
  .route("/:id")
  .get(machineEquipmentTypesController.getMachineEquipmentTypeById);

machineEquipmentTypeRouter
  .route("/delete/:id")
  .delete(
    authorizeModerator,
    machineEquipmentTypesController.deleteMachineEquipmentType,
  );
