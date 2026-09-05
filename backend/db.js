import dns from "node:dns";
import postgres from "postgres";

// En Vercel el host directo de Supabase sale por IPv6 y el build falla con ENETUNREACH
dns.setDefaultResultOrder("ipv4first");

const globalForDb = globalThis;
const SUPABASE_POOLER_HOST = "aws-0-eu-west-1.pooler.supabase.com";

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

function createSql() {
  const connectionUrl = process.env.DATABASE_URL;

  // Solo fallamos al usar la base, no al importar el modulo (el build de Vercel importa /staff)
  if (!connectionUrl) {
    throw new Error("DATABASE_URL no esta definida");
  }

  const isServerless = Boolean(process.env.VERCEL);

  return postgres(connectionUrlForRuntime(connectionUrl), {
    ssl: "require",
    // En Vercel cada instancia atiende pocas peticiones; en local varias a la vez se encolaban con max: 1
    max: isServerless ? 1 : 8,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

function getSql() {
  if (!globalForDb.__taipeiSql) {
    globalForDb.__taipeiSql = createSql();
  }

  return globalForDb.__taipeiSql;
}

// Proxy: el cliente se crea en la primera consulta, no al cargar el archivo
export const sql = new Proxy(function sqlTag() {}, {
  apply(_target, _thisArg, args) {
    return getSql()(...args);
  },
  get(_target, property) {
    const client = getSql();
    const value = client[property];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
