import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  STAFF_HOME_PATH,
  STAFF_LOGIN_PATH,
  isStaffRole,
  readSessionFromToken,
} from "./backend/session-token";
import { isPublicPath } from "./lib/public-paths";

function isStaffPath(pathname: string) {
  return pathname === STAFF_HOME_PATH || pathname.startsWith(`${STAFF_HOME_PATH}/`);
}

function isStaffLoginPath(pathname: string) {
  return pathname === STAFF_LOGIN_PATH || pathname.startsWith(`${STAFF_LOGIN_PATH}/`);
}

function continueWithPath(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionFromToken(request.cookies.get(SESSION_COOKIE)?.value);
  const role = String(session?.role || "");
  const staffSession = Boolean(session && isStaffRole(role));

  // Personal: no mezclar con la web de clientes; solo panel (o login si aún no hay sesión)
  if (staffSession) {
    if (isStaffPath(pathname)) {
      return continueWithPath(request);
    }
    return NextResponse.redirect(new URL(STAFF_HOME_PATH, request.url));
  }

  if (isStaffPath(pathname)) {
    if (!session) {
      return NextResponse.redirect(new URL(STAFF_LOGIN_PATH, request.url));
    }
    return NextResponse.redirect(new URL("/food", request.url));
  }

  // Cliente ya logueado no necesita la pantalla de acceso del personal
  if (session && isStaffLoginPath(pathname)) {
    return NextResponse.redirect(new URL("/food", request.url));
  }

  if (isPublicPath(pathname)) {
    return continueWithPath(request);
  }

  if (session) {
    return continueWithPath(request);
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
