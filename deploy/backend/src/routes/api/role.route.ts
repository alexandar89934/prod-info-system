import { Router } from "express";

import { roleController } from "../../controllers";
import { verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";

export const roleRouter = Router();
roleRouter.use(verifyTokenMiddleware);
roleRouter.route("/").get(roleController.getAllRoles);
