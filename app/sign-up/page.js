"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpAction } from "../../backend/actions/user";
import { buildAuthQuery, safeRedirectPath } from "../../backend/safe-redirect";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectPath = safeRedirectPath(searchParams.get("redirect"));
  const reason = searchParams.get("reason");
  const authQuery = buildAuthQuery(redirectPath, reason);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signUpAction(new FormData(event.currentTarget));
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-lg sm:p-8"
      >
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Crear cuenta</h1>
        <p className="mt-2 text-sm text-stone-600">
          {reason === "cart"
            ? "Crea una cuenta para añadir platos al carrito."
            : "Taipei guarda tu contraseña hasheada, no en texto."}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-stone-800" htmlFor="firstName">
              Nombre
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 p-3 text-stone-900 outline-none focus:border-red-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-800" htmlFor="lastName">
              Apellidos
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-stone-300 p-3 text-stone-900 outline-none focus:border-red-700"
            />
          </div>
        </div>

        <label className="mt-4 block text-sm font-medium text-stone-800" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-stone-300 p-3 text-stone-900 outline-none focus:border-red-700"
        />

        <label className="mt-4 block text-sm font-medium text-stone-800" htmlFor="password">
          Contraseña (mínimo 8)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-stone-300 p-3 text-stone-900 outline-none focus:border-red-700"
        />

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60"
        >
          {isSubmitting ? "Creando..." : "Registrarme"}
        </button>

        <p className="mt-4 text-center text-sm text-stone-600">
          ¿Ya tienes cuenta?{" "}
          <Link href={`/sign-in${authQuery}`} className="font-semibold text-red-700 hover:underline">
            Entra
          </Link>
        </p>
      </form>
  );
}

export default function SignUpPage() {
  return (
    <main className="background-image flex min-h-[calc(100svh-8rem)] items-center justify-center px-4 py-10 sm:py-16">
      <Suspense fallback={<p className="text-white">Cargando...</p>}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}
