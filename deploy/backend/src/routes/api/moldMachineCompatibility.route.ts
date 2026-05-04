import { Router } from "express";

import { moldMachineCompatibilityController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreateMoldMachineCompatibilitySchema,
  UpdateMoldMachineCompatibilitySchema,
} from "../../shared/joi/moldMachineCompatibility.schema";

export const moldMachineCompatibilityRouter = Router();

moldMachineCompatibilityRouter.use(verifyTokenMiddleware);

moldMachineCompatibilityRouter
  .route("/mold/:moldId")
  .get(moldMachineCompatibilityController.getCompatibleMachines);

moldMachineCompatibilityRouter
  .route("/create")
  .post(
    validateRequestBody(CreateMoldMachineCompatibilitySchema),
    authorizeAdmin,
    moldMachineCompatibilityController.createCompatibility,
  );

moldMachineCompatibilityRouter
  .route("/update/:id")
  .put(
    validateRequestBody(UpdateMoldMachineCompatibilitySchema),
    authorizeAdmin,
    moldMachineCompatibilityController.updateCompatibility,
  );

moldMachineCompatibilityRouter
  .route("/delete/:id")
  .delete(authorizeModerator, moldMachineCompatibilityController.deleteCompatibility);