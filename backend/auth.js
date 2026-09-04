"use server";

import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { sql } from "./db";
import { SESSION_COOKIE, getSessionSecretKey, isStaffRole, readSessionFromToken } from "./session-token";

const SESSION_DAYS = 7;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function toPublicUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    photo: row.photo_url,
    role: row.role,
  };
}

async function writeSessionCookie(token) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

async function createSession(user) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const [session] = await sql`
    insert into sessions (user_id, token_hash, expires_at)
    values (${user.id}, ${tokenHash}, ${expiresAt.toISOString()})
    returning id
  `;

  const jwt = await new SignJWT({ sid: String(session.id), role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSessionSecretKey());

  await writeSessionCookie(jwt);
}

export async function getSessionPayload() {
  const store = await cookies();
  return readSessionFromToken(store.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const payload = await getSessionPayload();
  if (!payload?.sub || !payload.sid) {
    return null;
  }

  const [row] = await sql`
    select users.id, users.email, users.first_name, users.last_name, users.photo_url, users.role
    from users
    inner join sessions on sessions.user_id = users.id
    where users.id = ${payload.sub}
      and sessions.id = ${payload.sid}
      and sessions.expires_at > now()
      and users.is_active = true
    limit 1
  `;

  return toPublicUser(row);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Debes iniciar sesion");
  }
  return user;
}

export async function registerUser({ email, password, firstName, lastName }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanFirst = String(firstName || "").trim();
  const cleanLast = String(lastName || "").trim();

  if (!cleanEmail.includes("@") || password.length < 8 || !cleanFirst || !cleanLast) {
    throw new Error("Revisa email, nombre y una contrasena de al menos 8 caracteres");
  }

  const [existing] = await sql`select id from users where email = ${cleanEmail} limit 1`;
  if (existing) {
    throw new Error("Ese email ya esta registrado");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await sql`
    insert into users (email, password_hash, first_name, last_name)
    values (${cleanEmail}, ${passwordHash}, ${cleanFirst}, ${cleanLast})
    returning id, email, first_name, last_name, photo_url, role
  `;

  await sql`insert into carts (user_id) values (${user.id})`;
  await createSession(user);
  return toPublicUser(user);
}

async function authenticateUser({ email, password }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const [user] = await sql`
    select id, email, password_hash, first_name, last_name, photo_url, role, is_active
    from users
    where email = ${cleanEmail}
    limit 1
  `;

  if (!user || !user.is_active) {
    throw new Error("Email o contrasena no validos");
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new Error("Email o contrasena no validos");
  }

  return user;
}

export async function loginUser({ email, password }) {
  const user = await authenticateUser({ email, password });
  await createSession(user);
  return toPublicUser(user);
}

export async function loginStaffUser({ email, password }) {
  const user = await authenticateUser({ email, password });
  if (!isStaffRole(user.role)) {
    throw new Error("Esta entrada es solo para el personal de Taipei");
  }
  await createSession(user);
  return toPublicUser(user);
}

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaffRole(user.role)) {
    throw new Error("No tienes acceso al area de personal");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireStaff();
  if (user.role !== "admin") {
    throw new Error("Solo administracion puede hacer esto");
  }
  return user;
}

export async function logoutUser() {
  const payload = await getSessionPayload();
  if (payload?.sid) {
    await sql`delete from sessions where id = ${payload.sid}`;
  }

  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
