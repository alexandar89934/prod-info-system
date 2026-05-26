import { Router } from "express";

import { productionPlanController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { authorizePlanCreator, authorizePlanDeleter, authorizePlanEditor, verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import {
  CreateProductionPlanSchema,
  ReorderProductionPlansSchema,
  UpdateProductionPlanSchema,
  UpdateProductionPlanStatusSchema,
} from "../../shared/joi/productionPlan.schema";

export const productionPlanRouter = Router();

// Public endpoint — called by external machine devices (no auth token required)
productionPlanRouter.route("/machine-cycle").post(productionPlanController.machineCycleEvent);

productionPlanRouter.use(verifyTokenMiddleware);

productionPlanRouter.route("/").get(productionPlanController.getAllProductionPlans);
productionPlanRouter.route("/by-machine/:machineId").get(productionPlanController.getProductionPlansByMachine);
productionPlanRouter.route("/by-machine-all/:machineId").get(productionPlanController.getAllPlansByMachine);
productionPlanRouter.route("/by-order/:orderId").get(productionPlanController.getProductionPlansByOrder);
productionPlanRouter.route("/create").post(authorizePlanCreator, validateRequestBody(CreateProductionPlanSchema), productionPlanController.createProductionPlan);
productionPlanRouter.route("/update/:id").put(authorizePlanEditor, validateRequestBody(UpdateProductionPlanSchema), productionPlanController.updateProductionPlan);
productionPlanRouter.route("/update-status/:id").patch(authorizePlanEditor, validateRequestBody(UpdateProductionPlanStatusSchema), productionPlanController.updateProductionPlanStatus);
productionPlanRouter.route("/reorder/:machineId").patch(authorizePlanEditor, validateRequestBody(ReorderProductionPlansSchema), productionPlanController.reorderPlans);
productionPlanRouter.route("/delete/:id").delete(authorizePlanDeleter, productionPlanController.deleteProductionPlan);
productionPlanRouter.route("/:id").get(productionPlanController.getProductionPlanById);