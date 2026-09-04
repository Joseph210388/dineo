// Solo permitimos volver a rutas internas, nunca a otro dominio
export function safeRedirectPath(value, fallback = "/food") {
  const path = String(value || "");
  if (!path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}

export function buildAuthQuery(redirectPath, reason) {
  const params = new URLSearchParams();
  if (redirectPath) {
    params.set("redirect", redirectPath);
  }
  if (reason) {
    params.set("reason", reason);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
