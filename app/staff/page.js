import { redirect } from "next/navigation";
import { requireStaff } from "../../backend/auth";
import { signOutAction } from "../../backend/actions/user";

export const metadata = {
  title: "Panel del personal | Taipei",
  robots: { index: false, follow: false },
};

export default async function StaffHomePage() {
  let user;

  try {
    user = await requireStaff();
  } catch {
    redirect("/acceso-personal");
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-700">Área interna</p>
      <h1 className="mt-3 text-[clamp(1.5rem,4vw,2.25rem)] text-stone-900">
        Hola, {user.firstName} {user.lastName}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
        Has entrado como {user.role === "admin" ? "administración" : "empleado"}.
        Esta zona no está enlazada en el menú de clientes.
      </p>
      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
