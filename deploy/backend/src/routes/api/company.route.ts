import { RequestHandler, Router } from "express";

import { companyController } from "../../controllers";
import { upload } from "../../config/multerConfig";
import { validateRequestBody } from "../../middlewares/requestValidation";
import { authorizeAdmin, authorizeModerator, verifyTokenMiddleware } from "../../middlewares/verifyTokenMiddleware";
import { CreateCompanySchema, UpdateCompanySchema } from "../../shared/joi/company.schema";

export const companyRouter = Router();

companyRouter.use(verifyTokenMiddleware);

companyRouter.route("/").get(companyController.getAllCompanies);
companyRouter.route("/list").get(companyController.getAllCompaniesList);
companyRouter.route("/upload-logo").post(upload.single("logo") as unknown as RequestHandler, companyController.uploadCompanyLogo);
companyRouter.route("/:id").get(companyController.getCompanyById);
companyRouter.route("/:id/delete-logo").delete(authorizeAdmin, companyController.deleteCompanyLogo);
companyRouter.route("/create").post(validateRequestBody(CreateCompanySchema), authorizeAdmin, companyController.createCompany);
companyRouter.route("/update/:id").put(validateRequestBody(UpdateCompanySchema), authorizeAdmin, companyController.updateCompany);
companyRouter.route("/delete/:id").delete(authorizeModerator, companyController.deleteCompany);