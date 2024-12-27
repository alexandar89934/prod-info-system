import crypto from "crypto";

import { ApiError } from "../error/ApiError";

import { config } from "./../../config/config";
import { logger } from "./../../config/logger";

export const hashSensitiveData = (sensitiveData: string): Promise<string> =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(
      sensitiveData,
      config.hash.salt,
      1000,
      64,
      "sha512",
      (err, derivedKey) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          const hashedPass = derivedKey.toString("hex");
          resolve(hashedPass);
        }
      },
    );
  });
export const compareHashedData = (
  inputData: string,
  storedHash: string,
): boolean => {
  try {
    const hash = crypto
      .pbkdf2Sync(inputData, config.hash.salt, 1000, 64, "sha512")
      .toString("hex");
    return storedHash === hash;
  } catch (e) {
    throw new ApiError(e);
  }
};
