import { Router } from "express";

import { maintenanceAssignmentController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { authorizeModerator, verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { CreateMaintenanceAssignmentsSchema } from "../../shared/joi/maintenanceAssignment.schema";

export const maintenanceAssignmentRouter = Router();

maintenanceAssignmentRouter.use(verifyTokenMiddleware);

maintenanceAssignmentRouter.route("/").get(maintenanceAssignmentController.getAllMaintenanceAssignments);
maintenanceAssignmentRouter.route("/by-template/:templateId").get(maintenanceAssignmentController.getAssignmentsByTemplate);
maintenanceAssignmentRouter.route("/available-targets/:targetType/:templateId").get(maintenanceAssignmentController.getAvailableTargets);
maintenanceAssignmentRouter
  .route("/create")
  .post(validateRequestBody(CreateMaintenanceAssignmentsSchema), authorizeModerator, maintenanceAssignmentController.createMaintenanceAssignments);
maintenanceAssignmentRouter.route("/delete/:id").delete(authorizeModerator, maintenanceAssignmentController.deleteMaintenanceAssignment);