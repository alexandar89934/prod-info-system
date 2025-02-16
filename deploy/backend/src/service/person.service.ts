import fs from "fs";
import path from "path";

import httpStatus from "http-status";

import {
  createPersonQuery,
  getAllPersonsQuery,
  getTotalPersonsCountQuery,
  getPersonByIdQuery,
  checkEmployeeNumberExists,
  deletePersonQuery,
  updatePersonDocumentsQuery,
  updatePersonImagePathQuery,
  updatePersonQuery,
} from "../models/person.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreatePersonData,
  EditPersonData,
  GetAllPersonsData,
} from "./person.service.types";

export const createPerson = async (
  data: CreatePersonData,
): Promise<CreatePersonData> => {
  const existingPerson = await checkEmployeeNumberExists(data.employeeNumber);

  if (existingPerson) {
    throw new ApiError(
      `Employee number ${data.employeeNumber} already exists!`,
      httpStatus.CONFLICT,
    );
  }
  return createPersonQuery(data);
};
export const updatePerson = async (
  data: EditPersonData,
): Promise<EditPersonData> => {
  const existingPerson = await checkEmployeeNumberExists(
    data.employeeNumber,
    data.id,
  );

  if (existingPerson) {
    throw new ApiError(
      `Employee number ${data.employeeNumber} already exists!`,
      httpStatus.CONFLICT,
    );
  }

  return updatePersonQuery(data);
};

const getTotalPersonsCount = async (): Promise<number> => {
  try {
    return await getTotalPersonsCountQuery();
  } catch (error) {
    throw new ApiError("Error while counting persons!");
  }
};

export const deletePerson = async (id: string): Promise<boolean | null> => {
  const person = await getPersonByIdQuery(id);

  if (!person) {
    return null;
  }

  if (person.picture) {
    const imagePath = path.join("/backend/src/", person.picture);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  if (Array.isArray(person.documents)) {
    person.documents.forEach((doc) => {
      const docPath = path.join("/backend/src/", doc.path);
      if (fs.existsSync(docPath)) {
        fs.unlinkSync(docPath);
      }
    });
  }

  await deletePersonQuery(id);

  return true;
};

export const deleteDocument: (
  id: string,
  docName: string,
) => Promise<[]> = async (id: string, docName: string): Promise<[]> => {
  try {
    const person = await getPersonByIdQuery(id);
    if (!person) {
      throw new ApiError("Person not found!", 404);
    }

    const documentPath = path.join("/backend/src/uploads/", docName);

    if (fs.existsSync(documentPath)) {
      fs.unlinkSync(documentPath);
    }
    const updatedDocuments = Array.isArray(person.documents)
      ? [...person.documents]
      : [];
    const filteredDocuments = updatedDocuments.filter(
      (doc) => doc.name.trim() !== docName.trim(),
    );

    const updatedDocumentsInDb = await updatePersonDocumentsQuery(
      id,
      filteredDocuments,
    );
    return updatedDocumentsInDb || [];
  } catch (error) {
    throw new ApiError("Error while deleting person!");
  }
};

export const deleteDocumentNewPerson: (
  docPath: string,
) => Promise<boolean> = async (docPath: string): Promise<boolean> => {
  try {
    const documentPath = path.join("/backend/src/", docPath);
    if (fs.existsSync(documentPath)) {
      fs.unlinkSync(documentPath);
      return true;
    }
    return false;
  } catch (error) {
    throw new ApiError("Error while deleting Document!");
  }
};

export const updateImagePath: (
  id: string,
  newImagePath: string,
) => Promise<string> = async (
  id: string,
  newImagePath: string,
): Promise<string> => {
  try {
    const person = await getPersonByIdQuery(id);
    if (!person) {
      throw new ApiError("Person not found!", 404);
    }
    const oldImagePath = person.picture;
    if (oldImagePath) {
      const oldImageFullPath = path.join("/backend/src/", oldImagePath);
      if (fs.existsSync(oldImageFullPath)) {
        fs.unlinkSync(oldImageFullPath);
      }
    }

    const updatedPerson = await updatePersonImagePathQuery(id, newImagePath);
    if (!updatedPerson) {
      throw new ApiError("Error updating image path in database!", 500);
    }

    return updatedPerson;
  } catch (error) {
    throw new ApiError("Error while updating person image path!");
  }
};

export const getAllPersons: (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
) => Promise<GetAllPersonsData> = async (
  limit: number,
  offset: number,
  search: string,
  sortField: string,
  sortOrder: string,
): Promise<GetAllPersonsData> => {
  try {
    const persons = await getAllPersonsQuery(
      limit,
      offset,
      search,
      sortField,
      sortOrder,
    );

    const totalPersons = await getTotalPersonsCount();

    return { currentPage: 0, totalPages: 0, persons, totalPersons };
  } catch (error) {
    throw new ApiError("Error while fetching persons!");
  }
};

export const getPersonById: (
  id: string,
) => Promise<CreatePersonData | null> = async (
  id: string,
): Promise<CreatePersonData | null> => {
  try {
    const person = await getPersonByIdQuery(id);

    if (!person) {
      throw new ApiError(`Person with ID ${id} not found!`);
    }

    return person;
  } catch (error) {
    throw new ApiError("Error while fetching person by ID!");
  }
};

export const updatePersonsDocuments = async (
  id: string,
  filePath: string,
  fileName: string,
): Promise<[]> => {
  try {
    const person = await getPersonByIdQuery(id);
    if (!person) {
      throw new ApiError("Person not found!", 404);
    }
    const updatedDocuments = Array.isArray(person.documents)
      ? [...person.documents]
      : [];

    updatedDocuments.push({
      name: fileName,
      path: filePath,
      dateAdded: new Date(),
    });

    const updatedDocumentsInDb = await updatePersonDocumentsQuery(
      id,
      updatedDocuments,
    );
    return updatedDocumentsInDb || [];
  } catch (error) {
    throw new ApiError("Error while updating person documents!", 500);
  }
};
