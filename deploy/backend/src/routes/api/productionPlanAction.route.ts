import { Router } from "express";

import { productionPlanActionController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { CreateProductionPlanActionSchema, VerifyActionPermissionSchema } from "../../shared/joi/productionPlanAction.schema";

export const productionPlanActionRouter = Router();

productionPlanActionRouter.use(verifyTokenMiddleware);

productionPlanActionRouter
  .route("/by-plan/:planId")
  .get(productionPlanActionController.getActionsByPlan);

productionPlanActionRouter
  .route("/create")
  .post(validateRequestBody(CreateProductionPlanActionSchema), productionPlanActionController.createAction);

productionPlanActionRouter
  .route("/verify-permission")
  .post(validateRequestBody(VerifyActionPermissionSchema), productionPlanActionController.verifyActionPermission);