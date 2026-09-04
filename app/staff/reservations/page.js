import Link from "next/link";
import { listStaffReservations } from "../../../backend/actions/staff";
import { formatDate, formatMoney } from "../../../backend/staff-format";
import { ReservationBadge } from "../../../components/staff/status-badge";

export default async function StaffReservationsPage() {
  const reservations = await listStaffReservations();

  return (
    <main className="mx-auto w-full max-w-6xl">
      <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Reservas</h1>
      <p className="mt-1 text-sm text-stone-500">Consulta, confirma o cancela las reservas del local.</p>

      {reservations.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          Todavía no hay reservas.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="hidden grid-cols-[1.3fr_1fr_0.6fr_0.7fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 lg:grid">
            <span>Cliente</span>
            <span>Fecha</span>
            <span>Total</span>
            <span>Estado</span>
          </div>
          <ul className="divide-y divide-stone-100">
            {reservations.map((reservation) => (
              <li key={reservation.id}>
                <Link
                  href={`/staff/reservations/${reservation.id}`}
                  className="grid grid-cols-1 gap-2 px-4 py-3 transition hover:bg-stone-50 sm:px-5 lg:grid-cols-[1.3fr_1fr_0.6fr_0.7fr] lg:items-center lg:gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-800">{reservation.guestName}</p>
                    <p className="truncate text-xs text-stone-500">{reservation.guestEmail}</p>
                  </div>
                  <p className="text-sm text-stone-600">
                    {formatDate(reservation.date)} · {reservation.time} · {reservation.people} pers.
                  </p>
                  <p className="text-sm font-medium text-stone-800">{formatMoney(reservation.total)}</p>
                  <ReservationBadge status={reservation.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
