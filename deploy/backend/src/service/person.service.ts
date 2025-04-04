import fs from "fs";
import path from "path";

import httpStatus from "http-status";

import {
  checkEmployeeNumberExists,
  createPersonQuery,
  deletePersonQuery,
  deleteUserQuery,
  getAllPersonsQuery,
  getPersonByEmployeeNumberQuery,
  getPersonByIdQuery,
  getTotalPersonsCountQuery,
  updatePersonDocumentsQuery,
  updatePersonImagePathQuery,
  updatePersonQuery,
} from "../models/person.model";
import {
  getUserByEmployeeNumber,
  getUserRolesById,
} from "../models/user.model";
import { ApiError } from "../shared/error/ApiError";

import {
  CreatePersonData,
  EditPersonData,
  GetAllPersonsData,
} from "./person.service.types";
import { createUser, updateUserRoles } from "./user.service";

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
  await createUser(String(data.employeeNumber), data.roles ?? []);
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

export const updatePersonUserRoles = async (
  data: EditPersonData,
): Promise<void> => {
  return updateUserRoles(String(data.employeeNumber), data.roles ?? []);
};

const getTotalPersonsCount = async (): Promise<number> => {
  return getTotalPersonsCountQuery();
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
  await deleteUserQuery(String(person.employeeNumber));
  await deletePersonQuery(id);

  return true;
};

export const deleteDocument = async (
  id: string,
  docName: string,
): Promise<[]> => {
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

  return (await updatePersonDocumentsQuery(id, filteredDocuments)) || [];
};

export const deleteDocumentNewPerson: (
  docPath: string,
) => Promise<string> = async (docPath: string): Promise<string> => {
  const documentPath = path.join("/backend/src/", docPath);
  if (fs.existsSync(documentPath)) {
    fs.unlinkSync(documentPath);
  }
  return docPath;
};

export const updateImagePath: (
  id: string,
  newImagePath: string,
) => Promise<string> = async (
  id: string,
  newImagePath: string,
): Promise<string> => {
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
  const persons = await getAllPersonsQuery(
    limit,
    offset,
    search,
    sortField,
    sortOrder,
  );

  const totalPersons = await getTotalPersonsCount();

  return { currentPage: 0, totalPages: 0, persons, totalPersons };
};

export const getPersonById: (
  id: string,
) => Promise<CreatePersonData | null> = async (
  id: string,
): Promise<CreatePersonData | null> => {
  const person = await getPersonByIdQuery(id);
  const user = await getUserByEmployeeNumber(String(person?.employeeNumber));
  const roles = await getUserRolesById(user.id);

  if (!person) {
    throw new ApiError(`Person with ID ${id} not found!`);
  }

  return { ...person, roles };
};

export const getPersonByEmployeeNumber: (
  employeeNumber: string,
) => Promise<CreatePersonData | null> = async (
  employeeNumber: string,
): Promise<CreatePersonData | null> => {
  const person = await getPersonByEmployeeNumberQuery(employeeNumber);
  const user = await getUserByEmployeeNumber(employeeNumber);
  const roles = await getUserRolesById(user.id);

  if (!person) {
    throw new ApiError(`Person with ID ${employeeNumber} not found!`);
  }

  return { ...person, roles };
};

export const updatePersonsDocuments = async (
  id: string,
  filePath: string,
  fileName: string,
): Promise<[]> => {
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
};
