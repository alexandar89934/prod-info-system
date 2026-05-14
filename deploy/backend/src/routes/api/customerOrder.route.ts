import { Router } from "express";

import { customerOrderController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { authorizeModerator, authorizeOrderCreator, authorizeOrderEditor, verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { AddOrderLineSchema, CreateCustomerOrderSchema, UpdateCustomerOrderSchema } from "../../shared/joi/customerOrder.schema";

export const customerOrderRouter = Router();

customerOrderRouter.use(verifyTokenMiddleware);

customerOrderRouter.route("/").get(customerOrderController.getAllCustomerOrders);
customerOrderRouter.route("/:id").get(customerOrderController.getCustomerOrderById);
customerOrderRouter.route("/create").post(authorizeOrderCreator, validateRequestBody(CreateCustomerOrderSchema), customerOrderController.createCustomerOrder);
customerOrderRouter.route("/update/:id").put(authorizeOrderEditor, validateRequestBody(UpdateCustomerOrderSchema), customerOrderController.updateCustomerOrder);
customerOrderRouter.route("/delete/:id").delete(authorizeModerator, customerOrderController.deleteCustomerOrder);
customerOrderRouter.route("/:id/lines").post(authorizeOrderEditor, validateRequestBody(AddOrderLineSchema), customerOrderController.addOrderLine);
customerOrderRouter.route("/:id/lines/:lineId").delete(authorizeOrderEditor, customerOrderController.deleteOrderLine);