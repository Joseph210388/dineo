export const STAFF_LOGIN_PATH = "/acceso-personal";
export const STAFF_HOME_PATH = "/staff";

export function isInternalStaffPath(pathname) {
  return (
    pathname === STAFF_LOGIN_PATH ||
    pathname.startsWith(`${STAFF_LOGIN_PATH}/`) ||
    pathname === STAFF_HOME_PATH ||
    pathname.startsWith(`${STAFF_HOME_PATH}/`)
  );
}
