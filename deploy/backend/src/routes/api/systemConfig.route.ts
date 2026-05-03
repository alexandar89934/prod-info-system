import { Router } from "express";

import { systemConfigController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import { UpdateSystemConfigSchema } from "../../shared/joi/systemConfig.schema";

export const systemConfigRouter = Router();
systemConfigRouter.use(verifyTokenMiddleware);

systemConfigRouter.route("/").get(systemConfigController.getAllSystemConfigs);

systemConfigRouter.route("/:key").get(systemConfigController.getSystemConfigByKey);

systemConfigRouter
  .route("/update/:key")
  .put(
    validateRequestBody(UpdateSystemConfigSchema),
    authorizeAdmin,
    systemConfigController.updateSystemConfig,
  );