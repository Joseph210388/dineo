import StaffLink from "../../../../components/staff/staff-link";
import { notFound } from "next/navigation";
import {
  deleteReservationAndRedirectAction,
  getStaffReservation,
  listStaffDishes,
} from "../../../../backend/actions/staff";
import { formatDate, formatMoney, paymentMethodLabel } from "../../../../backend/staff-format";
import { ReservationBadge } from "../../../../components/staff/status-badge";
import ConfirmForm from "../../../../components/staff/confirm-form";
import StaffReservationEditForm from "../../../../components/staff/staff-reservation-edit-form";
import { dietaryLabel, tableTypeLabel } from "../../../../lib/reservation-preferences";
import { formatDurationLabel } from "../../../../lib/reservation-duration";
import { allowsReservationDishEdit } from "../../../../lib/payment-methods";

export default async function StaffReservationDetailPage({ params }) {
  const { id } = await params;
  const reservation = await getStaffReservation(id);

  if (!reservation) {
    notFound();
  }

  const canEditDishes = allowsReservationDishEdit(reservation.paymentMethod);
  const dishes = canEditDishes
    ? (await listStaffDishes()).filter(
        (dish) =>
          dish.isAvailable ||
          reservation.items.some((item) => item.dishId && item.dishId === dish.id)
      )
    : [];

  const tableLabel = reservation.tableNumber
    ? `Mesa ${reservation.tableNumber}${
        reservation.tableCapacity ? ` · hasta ${reservation.tableCapacity} pers.` : ""
      }`
    : tableTypeLabel(reservation.tableType);

  return (
    <main className="mx-auto w-full max-w-[90rem] px-[2%] sm:px-0">
      <StaffLink href="/staff/reservations" className="text-sm text-red-700 hover:underline">
        Volver a reservas
      </StaffLink>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Reserva #{reservation.id}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {formatDate(reservation.date)} · {reservation.time} · {reservation.people} personas
            {reservation.durationMinutes
              ? ` · ${formatDurationLabel(reservation.durationMinutes)}`
              : null}
          </p>
          <p className="mt-0.5 text-sm text-stone-600">
            {tableLabel}
            {" · "}
            {dietaryLabel(reservation.dietaryNote)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a
            href={`/api/reservations/${reservation.id}/invoice`}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Descargar PDF
          </a>
          <ReservationBadge status={reservation.status} />
        </div>
      </div>

      {/* Dos columnas en laptop+: resumen a la izquierda, edición a la derecha */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6 xl:gap-8">
        <aside className="flex flex-col gap-4 lg:col-span-4 xl:col-span-4">
          <article className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Cliente</p>
            <p className="mt-2 font-medium text-stone-800">{reservation.guestName}</p>
            <p className="text-sm text-stone-500">{reservation.guestEmail}</p>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {canEditDishes ? "Pago en el local" : "Pago online (sin editar)"}
            </p>
            <p className="mt-2 text-2xl text-stone-900">{formatMoney(reservation.total)}</p>
            <p className="text-xs text-stone-500">{paymentMethodLabel(reservation.paymentMethod)}</p>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              {canEditDishes
                ? "El método no se cambia. Si corregís platos, el total se actualiza y se cobra al llegar."
                : "Tarjeta/Bizum: no se tocan platos ni importe. Si hubo error, cancelar y crear otra reserva."}
            </p>
          </article>

          <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <h2 className="text-base text-stone-900">Pedido actual</h2>
            {reservation.items.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">Sin líneas de plato.</p>
            ) : (
              <ul className="mt-3 divide-y divide-stone-100">
                {reservation.items.map((item) => (
                  <li
                    key={`${item.dishId || item.name}-${item.quantity}`}
                    className="flex items-center justify-between gap-2 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate text-stone-700">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="shrink-0 font-medium text-stone-800">
                      {formatMoney(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {reservation.kitchenNote ? (
              <p className="mt-3 text-sm text-stone-500">Cocina: {reservation.kitchenNote}</p>
            ) : null}
            {reservation.notes ? (
              <p className="mt-1 text-sm text-stone-500">Notas: {reservation.notes}</p>
            ) : null}
          </section>

          <ConfirmForm
            action={deleteReservationAndRedirectAction}
            message="¿Eliminar esta reserva?"
            className="lg:mt-1"
          >
            <input type="hidden" name="id" value={reservation.id} />
            <button type="submit" className="text-sm text-red-700 hover:underline">
              Eliminar reserva
            </button>
          </ConfirmForm>
        </aside>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 lg:col-span-8 xl:col-span-8">
          <StaffReservationEditForm reservation={reservation} dishes={dishes} />
        </section>
      </div>
    </main>
  );
}
