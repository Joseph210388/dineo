import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  STAFF_HOME_PATH,
  STAFF_LOGIN_PATH,
  isStaffRole,
  readSessionFromToken,
} from "./backend/session-token";

const publicRoutes = ["/", "/about", "/contact", "/food", "/dish", "/sign-in", "/sign-up", STAFF_LOGIN_PATH];

function isPublicPath(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isStaffPath(pathname: string) {
  return pathname === STAFF_HOME_PATH || pathname.startsWith(`${STAFF_HOME_PATH}/`);
}

function continueWithPath(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionFromToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (isStaffPath(pathname)) {
    if (!session) {
      return NextResponse.redirect(new URL(STAFF_LOGIN_PATH, request.url));
    }
    if (!isStaffRole(String(session.role || ""))) {
      return NextResponse.redirect(new URL("/food", request.url));
    }
    return continueWithPath(request);
  }

  // El personal no pide desde la web pública: carrito e histórico van al panel
  if (
    session &&
    isStaffRole(String(session.role || "")) &&
    (pathname === "/cart" ||
      pathname === "/favorites" ||
      pathname === "/reservation" ||
      pathname.startsWith("/reservation/"))
  ) {
    return NextResponse.redirect(new URL("/staff/reservations", request.url));
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
