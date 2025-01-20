import { config } from "../config/config";
import { createAdminQuery, getAdminByUsername } from "../models/admin.model";
import { hashSensitiveData } from "../shared/utils/hash";

export const createAdmin = async () => {
  const { username, name, password } = config.adminCredentials;
  const emails = username.split(",");
  const names = name.split(",");

  await Promise.all(
    emails.map(async (email, index) => {
      const adminExists = await getAdminByUsername(email);
      if (!adminExists) {
        const hashedPassword = await hashSensitiveData(password);
        await createAdminQuery(email, hashedPassword, names[index]);
      }
    }),
  );
};
