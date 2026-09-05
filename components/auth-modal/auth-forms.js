"use client";

import { useEffect, useState } from "react";
import { signInAction, signUpAction } from "../../backend/actions/user";
import { useAuth } from "../auth-provider";

const fieldClass =
  "mt-1 w-full rounded-lg border border-stone-300 p-3 text-stone-900 outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15";

function reasonCopy(reason, mode) {
  if (reason === "cart") {
    return mode === "sign-up"
      ? "Crea una cuenta para añadir platos al carrito."
      : "Para añadir al carrito, entra o crea una cuenta.";
  }

  return mode === "sign-up"
    ? "Así podrás pedir, guardar favoritos y ver tu histórico."
    : "Usa el email y la contraseña de tu cuenta.";
}

const slideClass =
  "w-full transition-all duration-300 ease-out motion-reduce:transition-none";

export default function AuthForms({ mode, onModeChange, reason = "", onSuccess }) {
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = mode === "sign-up";

  useEffect(() => {
    setError("");
  }, [mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = isSignUp ? await signUpAction(formData) : await signInAction(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    await refreshUser();
    onSuccess?.();
  }

  return (
    <div className="w-full">
      <div className="relative grid grid-cols-2 rounded-xl bg-cream p-1">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-lg bg-red-800 transition-transform duration-300 ease-out motion-reduce:transition-none ${
            isSignUp ? "translate-x-full" : "translate-x-0"
          }`}
        />
        <button
          type="button"
          onClick={() => onModeChange("sign-in")}
          className={`relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
            isSignUp ? "text-stone-600 hover:text-stone-900" : "text-white"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => onModeChange("sign-up")}
          className={`relative z-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
            isSignUp ? "text-white" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          Registrarse
        </button>
      </div>

      <div className="relative mt-5 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className={`${slideClass} ${
            isSignUp ? "pointer-events-none absolute inset-x-0 top-0 -translate-x-8 opacity-0" : "relative translate-x-0 opacity-100"
          }`}
        >
          <h2 className="text-[clamp(1.4rem,4vw,1.85rem)] font-semibold text-stone-900">Entrar a Taipei</h2>
          <p className="mt-2 text-sm text-stone-600">{reasonCopy(reason, "sign-in")}</p>

          <label className="mt-5 block text-sm font-medium text-stone-800">
            Email
            <input
              className={fieldClass}
              name="email"
              type="email"
              required={!isSignUp}
              autoComplete="email"
              tabIndex={isSignUp ? -1 : 0}
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-stone-800">
            Contraseña
            <input
              className={fieldClass}
              name="password"
              type="password"
              required={!isSignUp}
              minLength={8}
              autoComplete="current-password"
              tabIndex={isSignUp ? -1 : 0}
            />
          </label>

          {!isSignUp && error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || isSignUp}
            className="mt-6 w-full rounded-lg bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60"
          >
            {isSubmitting && !isSignUp ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <form
          onSubmit={handleSubmit}
          className={`${slideClass} ${
            isSignUp ? "relative translate-x-0 opacity-100" : "pointer-events-none absolute inset-x-0 top-0 translate-x-8 opacity-0"
          }`}
        >
          <h2 className="text-[clamp(1.4rem,4vw,1.85rem)] font-semibold text-stone-900">Crear cuenta</h2>
          <p className="mt-2 text-sm text-stone-600">{reasonCopy(reason, "sign-up")}</p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-800">
              Nombre
              <input
                className={fieldClass}
                name="firstName"
                type="text"
                required={isSignUp}
                autoComplete="given-name"
                tabIndex={isSignUp ? 0 : -1}
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Apellidos
              <input
                className={fieldClass}
                name="lastName"
                type="text"
                required={isSignUp}
                autoComplete="family-name"
                tabIndex={isSignUp ? 0 : -1}
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-stone-800">
            Email
            <input
              className={fieldClass}
              name="email"
              type="email"
              required={isSignUp}
              autoComplete="email"
              tabIndex={isSignUp ? 0 : -1}
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-stone-800">
            Contraseña (mínimo 8)
            <input
              className={fieldClass}
              name="password"
              type="password"
              required={isSignUp}
              minLength={8}
              autoComplete="new-password"
              tabIndex={isSignUp ? 0 : -1}
            />
          </label>

          {isSignUp && error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || !isSignUp}
            className="mt-6 w-full rounded-lg bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60"
          >
            {isSubmitting && isSignUp ? "Creando..." : "Registrarme"}
          </button>
        </form>
      </div>
    </div>
  );
}
