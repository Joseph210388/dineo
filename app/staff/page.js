import Link from "next/link";
import { getDashboardStats } from "../../backend/actions/staff";
import { formatMoney, formatDate } from "../../backend/staff-format";
import { ReservationBadge } from "../../components/staff/status-badge";

export default async function StaffHomePage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Hoy", value: formatMoney(stats.todaySales), hint: `${stats.todayReservations} reservas hoy` },
    { label: "Este mes", value: formatMoney(stats.monthSales), hint: "Confirmadas y completadas" },
    { label: "Total cobrado", value: formatMoney(stats.allSales), hint: "Histórico del local" },
    { label: "Pendientes", value: String(stats.pendingCount), hint: "Reservas por atender" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Resumen</h1>
          <p className="mt-1 max-w-xl text-sm text-stone-500">
            Dinero de reservas confirmadas o completadas. Las pendientes no entran en la caja.
          </p>
        </div>
        <Link
          href="/staff/dishes/new"
          className="inline-flex w-fit rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nuevo plato
        </Link>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{card.label}</p>
            <p className="mt-2 text-[clamp(1.25rem,3vw,1.75rem)] text-stone-900">{card.value}</p>
            <p className="mt-1 text-xs text-stone-500">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Carta</p>
          <p className="mt-2 text-2xl text-stone-900">{stats.availableDishes}</p>
          <p className="text-sm text-stone-500">{stats.dishCount} platos en total</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Clientes</p>
          <p className="mt-2 text-2xl text-stone-900">{stats.customerCount}</p>
          <p className="text-sm text-stone-500">Cuentas activas</p>
        </article>
        <article className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Equipo</p>
          <p className="mt-2 text-2xl text-stone-900">{stats.staffCount}</p>
          <p className="text-sm text-stone-500">Empleados y admin</p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 sm:px-5">
          <h2 className="text-base text-stone-900">Últimas reservas</h2>
          <Link href="/staff/reservations" className="text-sm text-red-700 hover:underline">
            Ver todas
          </Link>
        </div>

        {stats.recentReservations.length === 0 ? (
          <p className="px-4 py-8 text-sm text-stone-500">Aún no hay reservas.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {stats.recentReservations.map((reservation) => (
              <li key={reservation.id}>
                <Link
                  href={`/staff/reservations/${reservation.id}`}
                  className="flex flex-col gap-2 px-4 py-3 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div>
                    <p className="font-medium text-stone-800">{reservation.guestName}</p>
                    <p className="text-xs text-stone-500">
                      {formatDate(reservation.date)} · {reservation.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ReservationBadge status={reservation.status} />
                    <span className="text-sm font-medium text-stone-800">{formatMoney(reservation.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
