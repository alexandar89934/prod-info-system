import { config } from "../config/config";
import { createPersonQuery } from "../models/person.model";
import {
  assignRoleToUser,
  getAllRoles,
  getRoleByName,
  updateUserRolesQuery,
} from "../models/role.model";
import {
  createUserQuery,
  getUserByEmployeeNumber,
  getUserByIdQuery,
  getUserRolesById,
} from "../models/user.model";
import { ApiError } from "../shared/error/ApiError";
import { hashSensitiveData } from "../shared/utils/hash";
import { decodeJWT } from "../shared/utils/token";

export const createUserInitial = async () => {
  const { employeeNumber, password, name } = config.adminCredentials;

  const userExists = await getUserByEmployeeNumber(employeeNumber);
  if (!userExists) {
    const hashedPassword = await hashSensitiveData(password);
    const user = await createUserQuery(employeeNumber, hashedPassword);
    await createPersonQuery({
      address: "Initial address",
      employeeNumber: Number(employeeNumber),
      mail: "initial@setup.com",
      name,
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: name,
      updatedBy: name,
    });
    const roles = await getAllRoles();
    await Promise.all(
      roles.map(async (role) => {
        try {
          await assignRoleToUser(user.id, role.id);
          console.log(
            `Assigned role ${role.id} (ID: ${role.id}) to user ${user.id}`,
          );
        } catch (error) {
          console.error(
            `Error assigning role ${role.id} to user ${user.id}:`,
            error,
          );
        }
      }),
    );
  }
};

export const createUser = async (employeeNumber: string, roles: number[]) => {
  const { password } = config.adminCredentials;

  const userExists = await getUserByEmployeeNumber(employeeNumber);
  if (!userExists) {
    const hashedPassword = await hashSensitiveData(password);
    const user = await createUserQuery(employeeNumber, hashedPassword);
    await Promise.all(roles.map((role) => assignRoleToUser(user.id, role)));
  }
};

export const updateUserRoles = async (
  employeeNumber: string,
  roles: number[],
) => {
  console.log("ovdeee");
  console.log(employeeNumber);
  const userExists = await getUserByEmployeeNumber(employeeNumber);
  const userRoles = await getUserRolesById(userExists.id);

  console.log(userExists);
  console.log(userRoles);
  await updateUserRolesQuery(userExists.id, roles, userRoles);
};

export const getUserById = async (id: string) => {
  const fetchedUser = await getUserByIdQuery(id);

  if (!fetchedUser) {
    throw new ApiError(`Error Getting User with id ${id}`);
  }

  return fetchedUser;
};

export const checkIfUser = async (token: string) => {
  const { userId, iat } = decodeJWT<{
    userId: string;
    iat: number;
  }>(token);
  const user = await getUserById(userId);
  if (!user) {
    return false;
  }
  return !(
    user.lastPasswordReset &&
    new Date(user.lastPasswordReset) > new Date(iat * 1000)
  );
};

export const checkIfAdmin = async (userId: string) => {
  const user = await getUserById(userId);
  const userRoles = await getUserRolesById(user.id);
  const role = await getRoleByName("Admin");
  return userRoles.includes(role.id);
};

export const checkIfModerator = async (userId: string) => {
  const user = await getUserById(userId);
  const userRoles = await getUserRolesById(user.id);
  const role = await getRoleByName("Moderator");
  return userRoles.includes(role.id);
};
