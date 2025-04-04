import fs from "fs";
import path from "path";

import { Request, Response } from "express";
import httpStatus from "http-status";

import { personService } from "../service";
import {
  CreatePersonData,
  EditPersonData,
} from "../service/person.service.types";
import { catchAsync } from "../shared/utils/CatchAsync";

export const createPerson = catchAsync(async (req: Request, res: Response) => {
  try {
    const personData: CreatePersonData = req.body;
    const person = await personService.createPerson(personData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully created Person!",
      content: {
        person,
      },
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: String(error) || "An error occurred while creating person.",
    });
  }
});

export const updatePerson = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing person ID in request.",
      });
    }

    const personData: EditPersonData = { ...req.body, id };

    const person = await personService.updatePerson(personData);
    await personService.updatePersonUserRoles(personData);

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully updated Person!",
      content: {
        person,
      },
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: String(error) || "An error occurred while updating person.",
    });
  }
});

export const getAllPersons = catchAsync(async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, sortField, sortOrder } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { persons, totalPersons } = await personService.getAllPersons(
      Number(limit),
      offset,
      String(search),
      String(sortField),
      String(sortOrder),
    );
    res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched persons.",
      content: {
        persons,
        pagination: {
          total: totalPersons,
          page: Number(page),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: String(error) || "An error occurred while fetching persons.",
    });
  }
});

export const deletePerson = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing person ID in request.",
      });
    }

    const deletedPerson = await personService.deletePerson(id);

    if (!deletedPerson) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Person not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully deleted Person!",
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: String(error) || "An error occurred while deleting person.",
    });
  }
});

export const deleteDocument = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { personId } = req.params;
      const { documentName } = req.body;

      if (!documentName) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: "Missing Document Name in request.",
        });
      }
      const documents = await personService.deleteDocument(
        personId,
        documentName,
      );

      if (!documents) {
        return res.status(httpStatus.NOT_FOUND).send({
          success: false,
          message: "Person not found!",
        });
      }

      return res.status(httpStatus.OK).send({
        success: true,
        message: "Successfully added Document.",
        content: documents,
      });
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: error.message || "An error occurred while deleting document.",
      });
    }
  },
);

export const deleteDocumentNewPerson = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { documentPath } = req.body;
      if (!documentPath) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: "Missing Document Path in request.",
        });
      }
      const documents =
        await personService.deleteDocumentNewPerson(documentPath);

      if (!documents) {
        return res.status(httpStatus.NOT_FOUND).send({
          success: false,
          message: "Person not found!",
        });
      }

      return res.status(httpStatus.OK).send({
        success: true,
        message: "Successfully deleted Document.",
        content: documents,
      });
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: String(error) || "An error occurred while deleting document.",
      });
    }
  },
);

export const updateImagePath = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { personId } = req.params;
      const { newImagePath } = req.body;

      if (!newImagePath) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: "Missing newImagePath in request.",
        });
      }

      const updatedPerson = await personService.updateImagePath(
        personId,
        newImagePath,
      );

      if (!updatedPerson) {
        return res.status(httpStatus.NOT_FOUND).send({
          success: false,
          message: "Person not found!",
        });
      }

      return res.status(httpStatus.OK).send({
        success: true,
        message: "Successfully updated image path.",
        content: updatedPerson,
      });
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: String(error) || "An error occurred while updating image.",
      });
    }
  },
);

export const getPersonById = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        success: false,
        message: "Missing person ID in request.",
      });
    }

    const person = await personService.getPersonById(id);

    if (!person) {
      return res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Person not found!",
      });
    }

    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully fetched person by Id.",
      content: {
        person,
      },
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: String(error) || "An error occurred while getting person.",
    });
  }
});

export const getPersonByEmployeeNumber = catchAsync(
  async (req: Request, res: Response) => {
    try {
      const { employeeNumber } = req.params;

      if (!employeeNumber) {
        return res.status(httpStatus.BAD_REQUEST).send({
          success: false,
          message: "Missing Employee Number in request.",
        });
      }

      const person =
        await personService.getPersonByEmployeeNumber(employeeNumber);

      if (!person) {
        return res.status(httpStatus.NOT_FOUND).send({
          success: false,
          message: "Person not found!",
        });
      }

      return res.status(httpStatus.OK).send({
        success: true,
        message: "Successfully fetched person by Id.",
        content: {
          person,
        },
      });
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: String(error) || "An error occurred while getting person.",
      });
    }
  },
);

export const uploadProfileImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  return res.status(200).json({ path: imagePath });
};

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  try {
    const { personId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const fileName = req.file.filename;
    const documents = await personService.updatePersonsDocuments(
      personId,
      filePath,
      fileName,
    );
    return res.status(httpStatus.OK).send({
      success: true,
      message: "Successfully added Document.",
      content: documents,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: String(error) || "An error occurred while uploading file.",
    });
  }
});

export const uploadFileNewPerson = catchAsync(
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      const fileName = req.file.filename;
      const document = {
        name: fileName,
        path: filePath,
        dateAdded: new Date(),
      };

      return res.status(httpStatus.OK).send({
        success: true,
        message: "Successfully added Document.",
        content: document,
      });
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: String(error) || "An error occurred while uploading file.",
      });
    }
  },
);

export const downloadDocument = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { fileName } = req.params; // Extract file name from URL

    if (!fileName) {
      return res.status(400).json({ message: "File name is required" });
    }

    const filePath = path.join("/backend/src/uploads/", fileName); // Adjust path as needed

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.download(filePath, fileName, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({ message: "Error downloading file" });
        }
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

export const viewDocument = async (
  req: Request,
  res: Response,
): Promise<Response | void> => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({ message: "File name is required" });
    }

    const filePath = path.join(__dirname, "../uploads", fileName); // Adjust path

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.sendFile(filePath, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({ message: "Error displaying file" });
        }
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};
