import { getAllRolesQuery } from "../models/role.model";

export const getAllRoles = async (): Promise<{ id: number }[]> => {
  return getAllRolesQuery();
};
