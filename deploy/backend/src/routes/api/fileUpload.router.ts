import { RequestHandler, Router } from "express";

import { upload } from "../../config/multerConfig";
import { fileUploadController } from "../../controllers";

export const fileUploadRouter = Router();

fileUploadRouter
  .route("/upload-single-file")
  .post(
    upload.single("uploadSingleFile") as unknown as RequestHandler,
    fileUploadController.uploadSingleFile,
  );

fileUploadRouter
  .route("/delete-file")
  .delete(fileUploadController.deleteFile);
