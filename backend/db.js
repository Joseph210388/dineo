import postgres from "postgres";

const globalForDb = globalThis;

function createSql() {
  const connectionUrl = process.env.DATABASE_URL;

  // Solo fallamos al usar la base, no al importar el modulo (el build de Vercel importa /staff)
  if (!connectionUrl) {
    throw new Error("DATABASE_URL no esta definida");
  }

  const isServerless = Boolean(process.env.VERCEL);

  return postgres(connectionUrl, {
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
