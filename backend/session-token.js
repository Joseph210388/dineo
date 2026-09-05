import { jwtVerify } from "jose";
import { STAFF_HOME_PATH, STAFF_LOGIN_PATH, isInternalStaffPath } from "../lib/staff-paths";
import { isStaffRole } from "../lib/roles";

export const SESSION_COOKIE = "taipei_session";
export { STAFF_HOME_PATH, STAFF_LOGIN_PATH, isInternalStaffPath, isStaffRole };

export function getSessionSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET no esta definida");
  }
  return new TextEncoder().encode(secret);
}

export async function readSessionFromToken(token) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecretKey());
    if (!payload.sub || !payload.sid) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
