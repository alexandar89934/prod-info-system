import { Router } from "express";

import { moldController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import { CreateMoldSchema, UpdateMoldSchema } from "../../shared/joi/mold.schema";

export const moldRouter = Router();

moldRouter.use(verifyTokenMiddleware);

moldRouter.route("/").get(moldController.getAllMolds);
moldRouter.route("/mounted-on/:machineId").get(moldController.getMoldMountedOnMachine);
moldRouter.route("/:id").get(moldController.getMoldById);
moldRouter.route("/create").post(validateRequestBody(CreateMoldSchema), authorizeAdmin, moldController.createMold);
moldRouter.route("/update/:id").put(validateRequestBody(UpdateMoldSchema), authorizeAdmin, moldController.updateMold);
moldRouter.route("/delete/:id").delete(authorizeModerator, moldController.deleteMold);