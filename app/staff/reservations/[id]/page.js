import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteReservationAction,
  getStaffReservation,
  updateReservationStatusAction,
} from "../../../../backend/actions/staff";
import { formatDate, formatMoney } from "../../../../backend/staff-format";
import { ReservationBadge } from "../../../../components/staff/status-badge";
import ConfirmForm from "../../../../components/staff/confirm-form";

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

export default async function StaffReservationDetailPage({ params }) {
  const { id } = await params;
  const reservation = await getStaffReservation(id);

  if (!reservation) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      <Link href="/staff/reservations" className="text-sm text-red-700 hover:underline">
        Volver a reservas
      </Link>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Reserva #{reservation.id}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {formatDate(reservation.date)} · {reservation.time} · {reservation.people} personas
          </p>
        </div>
        <ReservationBadge status={reservation.status} />
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Cliente</p>
          <p className="mt-2 font-medium text-stone-800">{reservation.guestName}</p>
          <p className="text-sm text-stone-500">{reservation.guestEmail}</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Total</p>
          <p className="mt-2 text-2xl text-stone-900">{formatMoney(reservation.total)}</p>
          <p className="text-xs text-stone-500">Suma de los platos pedidos</p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <h2 className="text-base text-stone-900">Platos</h2>
        {reservation.items.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">Esta reserva no tiene líneas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-100">
            {reservation.items.map((item) => (
              <li key={`${item.name}-${item.quantity}`} className="flex items-center justify-between py-2 text-sm">
                <span className="text-stone-700">
                  {item.quantity} × {item.name}
                </span>
                <span className="font-medium text-stone-800">{formatMoney(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        )}
        {reservation.notes ? <p className="mt-3 text-sm text-stone-500">Notas: {reservation.notes}</p> : null}
      </section>

      <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <h2 className="text-base text-stone-900">Cambiar estado</h2>
        <form action={updateReservationStatusAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="id" value={reservation.id} />
          <select
            name="status"
            defaultValue={reservation.status}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/20 sm:max-w-xs"
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Actualizar
          </button>
        </form>
      </section>

      <ConfirmForm action={deleteReservationAction} message="¿Eliminar esta reserva?" className="mt-4">
        <input type="hidden" name="id" value={reservation.id} />
        <button type="submit" className="text-sm text-red-700 hover:underline">
          Eliminar reserva
        </button>
      </ConfirmForm>
    </main>
  );
}
