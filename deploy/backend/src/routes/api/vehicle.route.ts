import { Router } from "express";

import { vehicleController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { authorizeAdmin, authorizeModerator, verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { CreateVehicleSchema, UpdateVehicleSchema } from "../../shared/joi/vehicle.schema";

export const vehicleRouter = Router();

vehicleRouter.use(verifyTokenMiddleware);

vehicleRouter.route("/").get(vehicleController.getAllVehicles);
vehicleRouter.route("/create").post(validateRequestBody(CreateVehicleSchema), authorizeAdmin, vehicleController.createVehicle);
vehicleRouter.route("/:id").get(vehicleController.getVehicleById);
vehicleRouter.route("/update/:id").put(validateRequestBody(UpdateVehicleSchema), authorizeModerator, vehicleController.updateVehicle);
vehicleRouter.route("/delete/:id").delete(authorizeAdmin, vehicleController.deleteVehicle);