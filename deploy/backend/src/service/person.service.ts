import httpStatus from "http-status";

import { logger } from "#logger";

import {
  checkEmployeeNumberExists,
  createPersonQuery,
  deletePersonQuery,
  getAllPersonsQuery,
  getPersonByEmployeeNumberQuery,
  getPersonByIdQuery,
  updatePersonDocumentsQuery,
  updatePersonImagePathQuery,
  updatePersonQuery,
} from "../models/person.model";
import { ApiError } from "../shared/error/ApiError";
import {
  deleteFileIfExists,
  deleteFilesIfExist,
} from "../shared/utils/fileUtils";

import {
  CreatePersonData,
  EditPersonData,
  GetAllPersonsData,
} from "./person.service.types";

export const createPerson = async (
  data: CreatePersonData,
): Promise<CreatePersonData> => {
  try {
    const { count } = await checkEmployeeNumberExists(data.employeeNumber);
    if (count > 0) {
      throw new ApiError(
        `Employee number ${data.employeeNumber} already exists!`,
        httpStatus.CONFLICT,
      );
    }
    // FIXME: Ovo bi trebao biti jedan query
    // FIXED
    return await createPersonQuery(data, data.roles ?? []);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while fetching person by ID!", 500);
  }
};

export const updatePerson = async (
  data: EditPersonData,
): Promise<EditPersonData> => {
  try {
    const { count } = await checkEmployeeNumberExists(
      data.employeeNumber,
      data.id,
    );
    if (count > 0) {
      throw new ApiError(
        `Employee number ${data.employeeNumber} already exists!`,
        httpStatus.CONFLICT,
      );
    }
    // TODO CHANCE EMPLOYEE NUMBER,IT IS WHAT IS CHANGED,SHOULD BE ORIGINAL PERSONS EMPLOYEE NUMBER
    // FIXME: Ovo bi trebao biti jedan query
    // FIXED
    return await updatePersonQuery(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while fetching person by ID!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deletePerson = async (id: string): Promise<boolean | null> => {
  try {
    const person = await getPersonByIdQuery(id);

    if (!person) {
      throw new ApiError("Person not found!", 404);
    }
    // FIXME: Ovo za dokumenta / fajlove izdvojiti u shared folder i koristiti u svim servisima
    // Ako budes ikad menjao da izmenis samo na jednom mestu i da uvek imas isti input i output
    // FIXED
    if (person.picture) {
      deleteFileIfExists(person.picture);
    }
    if (Array.isArray(person.documents)) {
      deleteFilesIfExist(person.documents.map((doc) => doc.path));
    }
    // FIXME: Ovo nije moglo kao jedan spojeni query? Sasvim ti je okej da napravis query koji radi dve uvezane stvari ako one imaju smisla
    // FIXED
    return await deletePersonQuery(id);
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while fetching person by ID!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteDocument: (
  id: string,
  docName: string,
) => Promise<[]> = async (id: string, docName: string): Promise<[]> => {
  try {
    const person = await getPersonByIdQuery(id);
    if (!person) {
      throw new ApiError("Person not found!", httpStatus.NOT_FOUND);
    }

    deleteFileIfExists(`uploads/${docName}`);

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
    // FIXME: Dodati proveru da li je error tipa ApiError i ako jeste samo ga proslediti dalje
    // Kako bi ti not found izasao iz catcha
    // FIXED
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while deleting document!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteDocumentNewPerson: (
  docPath: string,
) => Promise<string> = async (docPath: string): Promise<string> => {
  try {
    deleteFileIfExists(docPath);
    return docPath;
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while deleting Document!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
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
      throw new ApiError("Person not found!", httpStatus.NOT_FOUND);
    }

    if (person.picture) {
      deleteFileIfExists(person.picture);
    }

    const updatedPerson = await updatePersonImagePathQuery(id, newImagePath);
    if (!updatedPerson) {
      throw new ApiError(
        "Error updating image path in database!",
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedPerson.picture;
  } catch (error) {
    // FIXME: Isto dodati proveru da li je error tipa ApiError i ako jeste samo ga proslediti dalje
    // FIXED
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while updating person image path!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
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

    // FIXME: Ovo je greska, tako dajes netacne informacije frontendu,
    // On je trazio odredjen uslov za korisnike i ti treba da vratis koliko ima takvih korisnika a ne ukupno
    // Jer ce svako reci "u jebote ima 200 njih a posle trece stranice nema nikoga ko je ovo pravio"
    // FIXED -> bilo je nekoliko komentara u vezi sa ovim,sad smatram da je greska sto sam uopste imao odvojeni
    // query viska da dobavi broj takvih osoba kakve se pretrazuju,mislim da je dovoljno vratiti samo duzinu niza.
    const totalPersons = persons.length;
    const currentPage = Math.floor(offset / limit);
    const totalPages = Math.ceil(totalPersons / limit);

    return { currentPage, totalPages, persons, totalPersons };
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error while fetching persons!", httpStatus.NOT_FOUND);
  }
};

export const getPersonById: (
  id: string,
) => Promise<CreatePersonData | null> = async (
  id: string,
): Promise<CreatePersonData | null> => {
  try {
    // FIXME: Ovo bi trebalo da bude jedan query
    // FIXED
    const person = await getPersonByIdQuery(id);

    if (!person) {
      // FIXME: fali 404 status
      // FIXED
      throw new ApiError(
        `Person with ID ${id} not found!`,
        httpStatus.NOT_FOUND,
      );
    }

    return { ...person };
  } catch (error) {
    // FIXME: Isto dodati proveru da li je error tipa ApiError i ako jeste samo ga proslediti dalje
    // FIXED
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while fetching person by ID!",
      httpStatus.NOT_FOUND,
    );
  }
};

export const getPersonByEmployeeNumber = async (
  employeeNumber: string,
): Promise<CreatePersonData> => {
  try {
    const person = await getPersonByEmployeeNumberQuery(employeeNumber);
    if (!person) {
      throw new ApiError(
        `Person with employee number ${employeeNumber} not found!`,
        httpStatus.NOT_FOUND,
      );
    }
    return person;
  } catch (error) {
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while fetching person by employee number!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
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
      throw new ApiError("Person not found!", httpStatus.NOT_FOUND);
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
    // FIXME: Dodati proveru da li je error tipa ApiError i ako jeste samo ga proslediti dalje
    // FIXED
    logger.error(error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Error while updating person documents!",
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};
