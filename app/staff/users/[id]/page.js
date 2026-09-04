import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteStaffUserAction, getStaffUser, updateStaffUserAction } from "../../../../backend/actions/staff";
import { formatDate, formatMoney } from "../../../../backend/staff-format";
import ConfirmForm from "../../../../components/staff/confirm-form";

const inputClass =
  "mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/20";

export default async function StaffUserDetailPage({ params }) {
  const { id } = await params;
  let user;

  try {
    user = await getStaffUser(id);
  } catch {
    redirect("/staff");
  }

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      <Link href="/staff/users" className="text-sm text-red-700 hover:underline">
        Volver a usuarios
      </Link>
      <h1 className="mt-3 text-[clamp(1.4rem,3vw,2rem)] text-stone-900">
        {user.firstName} {user.lastName}
      </h1>
      <p className="mt-1 text-sm text-stone-500">{user.email} · alta {formatDate(user.createdAt)}</p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Reservas</p>
          <p className="mt-2 text-2xl text-stone-900">{user.reservationCount}</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Ha dejado en caja</p>
          <p className="mt-2 text-2xl text-stone-900">{formatMoney(user.spent)}</p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        <h2 className="text-base text-stone-900">Editar</h2>
        <form action={updateStaffUserAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={user.id} />
          <label className="block text-sm font-medium text-stone-700">
            Nombre
            <input className={inputClass} name="firstName" defaultValue={user.firstName} required />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Apellidos
            <input className={inputClass} name="lastName" defaultValue={user.lastName} required />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Rol
            <select className={inputClass} name="role" defaultValue={user.role}>
              <option value="customer">Cliente</option>
              <option value="employee">Empleado</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="flex items-center gap-2 self-end text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={user.isActive}
              className="h-4 w-4 rounded border-stone-300 text-red-700 focus:ring-red-700"
            />
            Cuenta activa
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            >
              Guardar
            </button>
          </div>
        </form>
      </section>

      <ConfirmForm
        action={deleteStaffUserAction}
        message="¿Eliminar este usuario y sus reservas? No se puede deshacer."
        className="mt-4"
      >
        <input type="hidden" name="id" value={user.id} />
        <button type="submit" className="text-sm text-red-700 hover:underline">
          Eliminar usuario
        </button>
      </ConfirmForm>
    </main>
  );
}
