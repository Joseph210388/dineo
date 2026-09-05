"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInStaffAction } from "../../backend/actions/user";
import PasswordInput from "../../components/password-input/password-input";

export default function StaffSignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signInStaffAction(new FormData(event.currentTarget));
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/staff");
    router.refresh();
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-stone-900 px-4 py-10 sm:py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-stone-700 bg-stone-800 p-6 text-white shadow-lg sm:p-8"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-400">Uso interno</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Personal Taipei</h1>
        <p className="mt-2 text-sm text-stone-300">
          Esta entrada no aparece en la web pública. Solo cuentas de empleado o administración.
        </p>

        <label className="mt-6 block text-sm font-medium text-stone-200" htmlFor="email">
          Email del personal
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1 w-full rounded-lg border border-stone-600 bg-stone-900 p-3 text-white outline-none focus:border-red-500"
        />

        <label className="mt-4 block text-sm font-medium text-stone-200" htmlFor="password">
          Contraseña
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={5}
          autoComplete="current-password"
          tone="dark"
          className="rounded-lg border border-stone-600 bg-stone-900 p-3 text-white outline-none focus:border-red-500"
        />

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-red-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60"
        >
          {isSubmitting ? "Comprobando..." : "Entrar al panel"}
        </button>
      </form>
    </main>
  );
}
