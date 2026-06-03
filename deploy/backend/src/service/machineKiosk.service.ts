import httpStatus from "http-status";
import { getPersonForActionVerificationQuery } from "../models/attendance.model";
import { checkIfAdminQuery, checkUserHasResponsibilityQuery } from "../models/user.model";
import { compareHashedData } from "../shared/utils/hash";
import { encodeJWT } from "../shared/utils/token";
import { ApiError } from "../shared/error/ApiError";

const KIOSK_RESPONSIBILITY_CODE = "pristup_kiosku_masine";

export const verifyKioskAccess = async (
  employeeNumber: string,
  pin: string
): Promise<{ personId: string; personName: string; kioskToken: string }> => {
  try {
    const person = await getPersonForActionVerificationQuery(employeeNumber);
    if (!person) throw new ApiError("Employee not found.", httpStatus.NOT_FOUND);

    if (person.pin) {
      const pinMatch = await compareHashedData(pin, person.pin);
      if (!pinMatch) throw new ApiError("Incorrect PIN.", httpStatus.UNPROCESSABLE_ENTITY);
    }

    const [adminResult] = await checkIfAdminQuery(person.userId);
    if (!adminResult?.isAdmin) {
      const [result] = await checkUserHasResponsibilityQuery(person.userId, KIOSK_RESPONSIBILITY_CODE);
      if (!result?.hasIt) {
        throw new ApiError(
          `This employee does not have the required permission: ${KIOSK_RESPONSIBILITY_CODE}`,
          httpStatus.FORBIDDEN
        );
      }
    }

    const kioskToken = encodeJWT({ userId: person.userId, kioskSession: true }, 43200);
    return { personId: person.personId, personName: person.name, kioskToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Error verifying kiosk access!", httpStatus.INTERNAL_SERVER_ERROR);
  }
};