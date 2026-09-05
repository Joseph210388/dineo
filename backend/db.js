import dns from "node:dns";
import postgres from "postgres";

// En Vercel el host directo de Supabase sale por IPv6 y el build falla con ENETUNREACH
dns.setDefaultResultOrder("ipv4first");

const globalForDb = globalThis;
// Este proyecto vive en el cluster aws-1, no en aws-0 (tenant/user not found)
const SUPABASE_POOLER_HOST = "aws-1-eu-west-1.pooler.supabase.com";

function connectionUrlForRuntime(rawUrl) {
  const onVercel = Boolean(process.env.VERCEL);

  if (!onVercel) {
    return rawUrl;
  }

  if (process.env.DATABASE_POOLER_URL) {
    return process.env.DATABASE_POOLER_URL;
  }

  try {
    const parsed = new URL(rawUrl);
    const directHost = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);

    // El pooler tiene IPv4; el usuario del pooler es postgres.<id del proyecto>
    if (directHost) {
      parsed.hostname = SUPABASE_POOLER_HOST;
      parsed.port = "6543";
      parsed.username = `postgres.${directHost[1]}`;
      parsed.searchParams.set("sslmode", "require");
      return parsed.toString();
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
}

function shouldReconnect(error) {
  const code = String(error?.code || "");
  return (
    code === "CONNECT_TIMEOUT" ||
    code === "CONNECTION_CLOSED" ||
    code === "CONNECTION_ENDED" ||
    code === "ECONNRESET"
  );
}

function resetSql() {
  const previous = globalForDb.__taipeiSql;
  globalForDb.__taipeiSql = null;
  if (previous?.end) {
    previous.end({ timeout: 1 }).catch(() => {});
  }
}

function createSql() {
  const connectionUrl = process.env.DATABASE_URL;

  // Solo fallamos al usar la base, no al importar el modulo (el build de Vercel importa /staff)
  if (!connectionUrl) {
    throw new Error("DATABASE_URL no esta definida");
  }

  const isServerless = Boolean(process.env.VERCEL);

  const client = postgres(connectionUrlForRuntime(connectionUrl), {
    ssl: "require",
    // En Vercel cada instancia atiende pocas peticiones; en local varias a la vez se encolaban con max: 1
    max: isServerless ? 1 : 8,
    idle_timeout: isServerless ? 10 : 20,
    max_lifetime: isServerless ? 60 : 0,
    // El limite de la funcion en Hobby es 10s; no podemos gastarlos todos en el handshake
    connect_timeout: 5,
    prepare: false,
    fetch_types: false,
    onclose() {
      if (globalForDb.__taipeiSql === client) {
        globalForDb.__taipeiSql = null;
      }
    },
  });

  return client;
}

function getSql() {
  if (!globalForDb.__taipeiSql) {
    globalForDb.__taipeiSql = createSql();
  }

  return globalForDb.__taipeiSql;
}

function isTaggedTemplateCall(args) {
  const first = args[0];
  return Boolean(first && Array.isArray(first.raw));
}

function runQuery(args) {
  return getSql()(...args);
}

// Proxy: el cliente se crea en la primera consulta, no al cargar el archivo
export const sql = new Proxy(function sqlTag() {}, {
  apply(_target, _thisArg, args) {
    // sql(ids) para un IN no es una consulta etiquetada; si se reintenta como Promise, Carta cae
    if (!isTaggedTemplateCall(args)) {
      return getSql()(...args);
    }

    const result = runQuery(args);

    if (result == null || typeof result.then !== "function") {
      return result;
    }

    return result.catch((error) => {
      if (!shouldReconnect(error)) {
        throw error;
      }
      resetSql();
      return runQuery(args);
    });
  },
  get(_target, property) {
    const client = getSql();
    const value = client[property];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
