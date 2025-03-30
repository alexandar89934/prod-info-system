import { RequestHandler, Router } from "express";

import { upload } from "../../config/multerConfig";
import { personController } from "../../controllers";
import { validateRequestBody } from "../../middlewares/requestValidation";
import {
  authorizeAdmin,
  authorizeModerator,
  authorizeSelf,
  verifyTokenMiddleware,
} from "../../middlewares/verifyTokenMiddleware";
import {
  CreatePersonSchema,
  UpdatePersonSchema,
} from "../../shared/joi/person.schema";

export const personRouter = Router();
personRouter.use(verifyTokenMiddleware);

personRouter
  .route("/create")
  .post(
    validateRequestBody(CreatePersonSchema),
    authorizeAdmin,
    personController.createPerson,
  );

// FIXME: Svako moze da izmeni podatke korisnika?
personRouter
  .route("/update/:id")
  .put(validateRequestBody(UpdatePersonSchema), personController.updatePerson);

personRouter.route("/").get(personController.getAllPersons);

personRouter
  .route("/delete/:id")
  .delete(authorizeModerator, authorizeSelf, personController.deletePerson);

personRouter
  .route("/delete-file/:personId")
  .delete(personController.deleteDocument);

personRouter
  .route("/delete-file-new-person/")
  .post(personController.deleteDocumentNewPerson);

personRouter.route("/:id").get(personController.getPersonById);

personRouter
  .route("/profile/:employeeNumber")
  .get(personController.getPersonByEmployeeNumber);

personRouter
  .route("/upload-image")
  .post(
    upload.single("profileImage") as unknown as RequestHandler,
    personController.uploadProfileImage,
  );

personRouter
  .route("/update-image/:personId")
  .put(personController.updateImagePath);

personRouter
  .route("/upload-file")
  .post(
    upload.single("uploadFile") as unknown as RequestHandler,
    personController.uploadFile,
  );

personRouter
  .route("/upload-file-new-person")
  .post(
    upload.single("uploadFile") as unknown as RequestHandler,
    personController.uploadFileNewPerson,
  );

personRouter.get("/download-file/:fileName", personController.downloadDocument);

personRouter.get("/view-file/:fileName", personController.viewDocument);
