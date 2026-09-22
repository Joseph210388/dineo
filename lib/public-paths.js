import { STAFF_LOGIN_PATH } from "./staff-paths";

/** Prefijos que el middleware deja pasar sin sesión. */
export const PUBLIC_ROUTE_PREFIXES = [
  "/",
  "/about",
  "/contact",
  "/food",
  "/blog",
  "/dish",
  "/privacy",
  "/terms",
  "/sign-in",
  "/sign-up",
  STAFF_LOGIN_PATH,
];

/** Rutas a comprobar en smoke (páginas concretas, no prefijos como /dish). */
export const PUBLIC_SMOKE_PATHS = [
  "/",
  "/food",
  "/blog",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/sign-in",
  "/sign-up",
  STAFF_LOGIN_PATH,
];

export function isPublicPath(pathname) {
  return PUBLIC_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
