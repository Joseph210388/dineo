const BASE = process.env.SMOKE_URL || "http://localhost:3000";

const PUBLIC_PATHS = [
  "/",
  "/food",
  "/about",
  "/contact",
  "/sign-in",
  "/sign-up",
  "/acceso-personal",
];

const AUTH_PATHS = ["/favorites", "/cart", "/reservation"];

const STAFF_PATHS = [
  "/staff",
  "/staff/dishes",
  "/staff/dishes/new",
  "/staff/ingredients",
  "/staff/allergens",
  "/staff/reservations",
  "/staff/users",
];

const OK_PUBLIC = new Set([200]);
const OK_AUTH = new Set([200, 307, 308]);
const OK_STAFF = new Set([200, 307, 308]);

async function probe(path, allowed) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${BASE}${path}`, {
      headers: { Accept: "text/html" },
      redirect: "manual",
      signal: controller.signal,
    });
    const body = await response.text();
    const ms = Date.now() - started;
    const crashed = body.includes("Application error");
    const ok = allowed.has(response.status) && !crashed && response.status !== 500 && response.status !== 504;

    return {
      path,
      status: response.status,
      ms,
      ok,
      crashed,
    };
  } catch (error) {
    return {
      path,
      status: 0,
      ms: Date.now() - started,
      ok: false,
      crashed: false,
      error: error.name === "AbortError" ? "timeout 12s" : error.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log(`Comprobando rutas en ${BASE}`);
  const results = [];

  for (const path of PUBLIC_PATHS) {
    results.push(await probe(path, OK_PUBLIC));
  }

  for (const path of AUTH_PATHS) {
    results.push(await probe(path, OK_AUTH));
  }

  for (const path of STAFF_PATHS) {
    results.push(await probe(path, OK_STAFF));
  }

  let failed = 0;
  for (const item of results) {
    const mark = item.ok ? "OK " : "FAIL";
    const extra = item.error || (item.crashed ? "pantalla de error" : "");
    console.log(`${mark} ${String(item.status).padStart(3)} ${String(item.ms).padStart(5)}ms  ${item.path}${extra ? `  (${extra})` : ""}`);
    if (!item.ok) {
      failed += 1;
    }
  }

  if (failed) {
    console.log(`\n${failed} rutas fallaron.`);
    process.exitCode = 1;
    return;
  }

  console.log("\nTodas las rutas respondieron bien (el panel sin sesión debe redirigir a Acceso personal).");
}

main();
