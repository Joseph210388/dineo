import postgres from "postgres";

const connectionUrl = process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error("DATABASE_URL no esta definida");
}

const globalForDb = globalThis;

// Una sola conexion reutilizable: Next recarga el codigo en cada cambio
export const sql =
  globalForDb.__taipeiSql ??
  postgres(connectionUrl, {
    ssl: "require",
    max: 1,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__taipeiSql = sql;
}
