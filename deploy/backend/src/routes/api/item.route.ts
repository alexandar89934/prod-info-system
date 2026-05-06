import { Router } from "express";

import { bomLineController, itemController, itemPackagingController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { authorizeAdmin, authorizeModerator, verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { CreateBomLineSchema, UpdateBomLineSchema } from "../../shared/joi/bomLine.schema";
import { CreateItemPackagingSchema, UpdateItemPackagingSchema } from "../../shared/joi/itemPackaging.schema";
import { CreateItemSchema, UpdateItemSchema } from "../../shared/joi/item.schema";

export const itemRouter = Router();

itemRouter.use(verifyTokenMiddleware);

itemRouter.route("/").get(itemController.getAllItems);
itemRouter.route("/produced-by/:moldId").get(itemController.getItemsByMold);
itemRouter.route("/:id").get(itemController.getItemById);
itemRouter.route("/create").post(validateRequestBody(CreateItemSchema), authorizeAdmin, itemController.createItem);
itemRouter.route("/update/:id").put(validateRequestBody(UpdateItemSchema), authorizeAdmin, itemController.updateItem);
itemRouter.route("/delete/:id").delete(authorizeModerator, itemController.deleteItem);

itemRouter.route("/:outputItemId/bom").get(bomLineController.getBomLinesByOutputItem);
itemRouter.route("/:outputItemId/bom/create").post(validateRequestBody(CreateBomLineSchema), authorizeAdmin, bomLineController.createBomLine);
itemRouter.route("/:outputItemId/bom/update/:id").put(validateRequestBody(UpdateBomLineSchema), authorizeAdmin, bomLineController.updateBomLine);
itemRouter.route("/:outputItemId/bom/delete/:id").delete(authorizeModerator, bomLineController.deleteBomLine);

itemRouter.route("/:itemId/packaging").get(itemPackagingController.getItemPackagingsByItem);
itemRouter.route("/:itemId/packaging/create").post(validateRequestBody(CreateItemPackagingSchema), authorizeAdmin, itemPackagingController.createItemPackaging);
itemRouter.route("/:itemId/packaging/update/:id").put(validateRequestBody(UpdateItemPackagingSchema), authorizeAdmin, itemPackagingController.updateItemPackaging);
itemRouter.route("/:itemId/packaging/delete/:id").delete(authorizeModerator, itemPackagingController.deleteItemPackaging);