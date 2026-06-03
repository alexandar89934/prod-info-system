import { Router } from "express";

import { maintenanceTemplateController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { authorizeAdmin, authorizeModerator, verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  CreateMaintenanceTemplateSchema,
  UpdateMaintenanceTemplateSchema,
} from "../../shared/joi/maintenanceTemplate.schema";

export const maintenanceTemplateRouter = Router();

maintenanceTemplateRouter.use(verifyTokenMiddleware);

maintenanceTemplateRouter.route("/").get(maintenanceTemplateController.getAllMaintenanceTemplates);
maintenanceTemplateRouter
  .route("/create")
  .post(validateRequestBody(CreateMaintenanceTemplateSchema), authorizeAdmin, maintenanceTemplateController.createMaintenanceTemplate);
maintenanceTemplateRouter.route("/:id").get(maintenanceTemplateController.getMaintenanceTemplateById);
maintenanceTemplateRouter
  .route("/update/:id")
  .put(validateRequestBody(UpdateMaintenanceTemplateSchema), authorizeAdmin, maintenanceTemplateController.updateMaintenanceTemplate);
maintenanceTemplateRouter
  .route("/delete/:id")
  .delete(authorizeModerator, maintenanceTemplateController.deleteMaintenanceTemplate);