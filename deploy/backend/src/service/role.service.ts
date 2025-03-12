import { config } from "#config";

import {
  createRoleQuery,
  getRoleByName,
  getAllRolesQuery,
} from "../models/role.model";
import { ApiError } from "../shared/error/ApiError";

export const createRoles = async () => {
  const { roles } = config.roles;
  const rolesArray = roles.split(",");

  await Promise.all(
    rolesArray.map(async (role) => {
      const roleExists = await getRoleByName(role);
      if (!roleExists) {
        await createRoleQuery(role);
      }
    }),
  );
};

export const getAllRoles = async (): Promise<{ id: number }[]> => {
  try {
    return await getAllRolesQuery();
  } catch (error) {
    throw new ApiError("Error while fetching roles!");
  }
};
