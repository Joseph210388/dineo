import { jwtVerify } from "jose";

export const SESSION_COOKIE = "taipei_session";
export const STAFF_LOGIN_PATH = "/acceso-personal";
export const STAFF_HOME_PATH = "/staff";

export function isStaffRole(role) {
  return role === "employee" || role === "admin";
}

export function isInternalStaffPath(pathname) {
  return (
    pathname === STAFF_LOGIN_PATH ||
    pathname.startsWith(`${STAFF_LOGIN_PATH}/`) ||
    pathname === STAFF_HOME_PATH ||
    pathname.startsWith(`${STAFF_HOME_PATH}/`)
  );
}

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
