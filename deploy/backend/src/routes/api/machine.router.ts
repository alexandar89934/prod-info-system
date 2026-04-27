import { Router } from "express";

import { machineController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import { CreateMachineSchema, UpdateMachineSchema } from "../../shared/joi/machine.schema";

export const machineRouter = Router();
machineRouter.use(verifyTokenMiddleware);

machineRouter
  .route("/create")
  .post(validateRequestBody(CreateMachineSchema), authorizeAdmin, machineController.createMachine);

machineRouter
  .route("/update/:id")
  .put(validateRequestBody(UpdateMachineSchema), authorizeAdmin, machineController.updateMachine);

machineRouter.route("/").get(machineController.getAllMachines);

machineRouter.route("/:id").get(machineController.getMachineById);

machineRouter
  .route("/delete/:id")
  .delete(authorizeModerator, machineController.deleteMachine);