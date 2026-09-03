"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, loginStaffUser, loginUser, logoutUser, registerUser } from "../auth";

export async function getSessionUser() {
  return getCurrentUser();
}

export async function signUpAction(formData) {
  try {
    await registerUser({
      email: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function signInAction(formData) {
  try {
    await loginUser({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function signInStaffAction(formData) {
  try {
    await loginStaffUser({
      email: formData.get("email"),
      password: formData.get("password"),
    });
  } catch (error) {
    return { ok: false, message: error.message };
  }

  // La cookie de sesion se guarda en esta respuesta; luego vamos al panel
  redirect("/staff");
}

export async function signOutAction() {
  await logoutUser();
}
