import { Router } from "express";

import { machineEquipmentController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  AssignMachineEquipmentSchema,
  CreateMachineEquipmentSchema,
  UpdateMachineEquipmentSchema,
} from "../../shared/joi/machineEquipment.schema";

export const machineEquipmentRouter = Router();
machineEquipmentRouter.use(verifyTokenMiddleware);

machineEquipmentRouter
  .route("/create")
  .post(
    validateRequestBody(CreateMachineEquipmentSchema),
    authorizeAdmin,
    machineEquipmentController.createMachineEquipment,
  );

machineEquipmentRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateMachineEquipmentSchema),
    authorizeAdmin,
    machineEquipmentController.updateMachineEquipment,
  );

machineEquipmentRouter
  .route("/")
  .get(machineEquipmentController.getAllMachineEquipment);

machineEquipmentRouter
  .route("/unassigned")
  .get(machineEquipmentController.getUnassignedEquipment);

machineEquipmentRouter
  .route("/assign/:id")
  .post(
    validateRequestBody(AssignMachineEquipmentSchema),
    authorizeAdmin,
    machineEquipmentController.assignEquipmentToMachine,
  );

machineEquipmentRouter
  .route("/unassign/:id")
  .delete(
    authorizeAdmin,
    machineEquipmentController.unassignEquipmentFromMachine,
  );

machineEquipmentRouter
  .route("/:id")
  .get(machineEquipmentController.getMachineEquipmentById);

machineEquipmentRouter
  .route("/delete/:id")
  .delete(
    authorizeModerator,
    machineEquipmentController.deleteMachineEquipment,
  );
