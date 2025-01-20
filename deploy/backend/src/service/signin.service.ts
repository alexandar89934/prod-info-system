import { getAdminByUsername } from "../models/admin.model";
import { AuthError } from "../shared/error/AuthError";
import { compareHashedData } from "../shared/utils/hash";
import { encodeJWT } from "../shared/utils/token";

export const adminSignIn = async (username: string, password: string) => {
  const user = await getAdminByUsername(username);

  if (!user) {
    throw new AuthError("Wrong username or password");
  }

  const passwordIsCorrect = compareHashedData(password, user.password);

  if (!passwordIsCorrect) {
    throw new AuthError("Wrong username or password");
  }

  return {
    token: encodeJWT<{ username: string }>({ username: user.username }, "3h"),
    user,
  };
};
