"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineUserGroup,
} from "react-icons/hi";
import StaffLink from "./staff-link";
import { ReservationBadge } from "./status-badge";
import StaffNewReservationPopup from "./staff-new-reservation-popup";
import { deleteReservationAction } from "../../backend/actions/staff";
import { formatDurationLabel } from "../../lib/reservation-duration";
import {
  listOpenHourOptions,
  reservationCoversTime,
  RESTAURANT_OPEN_TIME,
  RESTAURANT_CLOSE_TIME,
} from "../../lib/restaurant-hours";

const HOUR_OPTIONS = listOpenHourOptions();
const VIEW_ALL_DAY = "all";

function shiftDate(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatLongDate(isoDate) {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatShortDate(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const STAT_CARDS = [
  { key: "totalReservations", label: "Reservas totales", tone: "text-red-800 bg-red-50" },
  { key: "diners", label: "Comensales", tone: "text-stone-800 bg-stone-100" },
  { key: "reservedTables", label: "Mesas reservadas", tone: "text-amber-900 bg-amber-50" },
  { key: "availableTables", label: "Disponibles", tone: "text-emerald-800 bg-emerald-50" },
];

function defaultViewHour() {
  if (HOUR_OPTIONS.includes("20:00")) return "20:00";
  return HOUR_OPTIONS[0] || VIEW_ALL_DAY;
}

export default function StaffReservationsDayBoard({
  date,
  stats,
  tables,
  reservations,
  customers,
  dishes,
}) {
  const router = useRouter();
  const [popupOpen, setPopupOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [viewHour, setViewHour] = useState(defaultViewHour);
  const [hoveredTableId, setHoveredTableId] = useState(null);

  const activeList = useMemo(
    () => reservations.filter((item) => item.status !== "cancelled"),
    [reservations]
  );

  const tablesAtHour = useMemo(() => {
    return tables.map((table) => {
      const allSlots = Array.isArray(table.slots) ? table.slots : [];
      const activeSlots =
        viewHour === VIEW_ALL_DAY
          ? allSlots
          : allSlots.filter((slot) => reservationCoversTime(slot.time, slot.endTime, viewHour));
      return {
        ...table,
        activeSlots,
        busy: activeSlots.length > 0,
      };
    });
  }, [tables, viewHour]);

  const hourStats = useMemo(() => {
    const busy = tablesAtHour.filter((table) => table.busy).length;
    return {
      busy,
      free: Math.max(0, tablesAtHour.length - busy),
    };
  }, [tablesAtHour]);

  function goToDate(nextDate) {
    router.push(`/staff/reservations?date=${nextDate}`);
  }

  async function handleDelete(id) {
    if (!window.confirm("¿Eliminar esta reserva?")) return;
    setDeletingId(id);
    const data = new FormData();
    data.set("id", id);
    await deleteReservationAction(data);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-sm font-medium capitalize text-stone-700">{formatLongDate(date)}</p>
          <div className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1">
            <button
              type="button"
              aria-label="Día anterior"
              onClick={() => goToDate(shiftDate(date, -1))}
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
            >
              <HiOutlineChevronLeft className="h-4 w-4" />
            </button>
            <label className="sr-only" htmlFor="staff-res-date">
              Fecha
            </label>
            <input
              id="staff-res-date"
              type="date"
              value={date}
              onChange={(event) => goToDate(event.target.value)}
              className="w-[9.5rem] border-0 bg-transparent px-1 py-1.5 text-center text-sm font-semibold text-stone-800 outline-none"
            />
            <button
              type="button"
              aria-label="Día siguiente"
              onClick={() => goToDate(shiftDate(date, 1))}
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
            >
              <HiOutlineChevronRight className="h-4 w-4" />
            </button>
          </div>
          <span className="hidden text-xs text-stone-400 sm:inline">{formatShortDate(date)}</span>
        </div>

        <button
          type="button"
          onClick={() => setPopupOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-900"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Nueva reserva
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <article
            key={card.key}
            className="rounded-2xl border border-stone-200/90 bg-white px-4 py-3 shadow-sm shadow-stone-900/5"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">
              {card.label}
            </p>
            <p className={`mt-2 inline-flex rounded-lg px-2 py-0.5 text-2xl font-semibold tabular-nums ${card.tone}`}>
              {stats?.[card.key] ?? 0}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <section className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm shadow-stone-900/5 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Plano de mesas</h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Abierto {RESTAURANT_OPEN_TIME} – {RESTAURANT_CLOSE_TIME} ·{" "}
                {viewHour === VIEW_ALL_DAY
                  ? "Vista del día completo"
                  : `Ocupación a las ${viewHour}`}
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-1 sm:min-w-[9rem] sm:items-end">
              <label
                htmlFor="floor-view-hour"
                className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500"
              >
                Ver a las
              </label>
              <select
                id="floor-view-hour"
                value={viewHour}
                onChange={(event) => setViewHour(event.target.value)}
                className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-stone-800 outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15"
              >
                <option value={VIEW_ALL_DAY}>Todo el día</option>
                {HOUR_OPTIONS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              {viewHour !== VIEW_ALL_DAY ? (
                <p className="text-[0.65rem] text-stone-500">
                  {hourStats.free} libres · {hourStats.busy} ocupadas
                </p>
              ) : null}
            </div>
          </div>

          {tables.length === 0 ? (
            <p className="mt-6 text-center text-sm text-stone-500">No hay mesas configuradas.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
              {tablesAtHour.map((table) => {
                const busy = table.busy;
                const slots = table.activeSlots;
                const showTip = hoveredTableId === table.id && busy && slots.length > 0;
                const tipSlot = slots[0];

                return (
                  <div
                    key={table.id}
                    className="relative"
                    onMouseEnter={() => setHoveredTableId(table.id)}
                    onMouseLeave={() => setHoveredTableId(null)}
                    onFocus={() => setHoveredTableId(table.id)}
                    onBlur={() => setHoveredTableId(null)}
                  >
                    <div
                      tabIndex={0}
                      className={`flex w-full flex-col items-center justify-center rounded-xl border-2 px-2 py-3 text-center outline-none transition focus-visible:ring-4 focus-visible:ring-red-700/20 ${
                        busy
                          ? "border-red-700/40 bg-red-50"
                          : "border-emerald-600/30 bg-emerald-50/70"
                      }`}
                      aria-label={
                        busy
                          ? `Mesa ${table.number} ocupada${
                              tipSlot
                                ? `, reserva ${tipSlot.id}, ${tipSlot.people} personas, ${formatDurationLabel(tipSlot.durationMinutes)}`
                                : ""
                            }`
                          : `Mesa ${table.number} libre`
                      }
                    >
                      <p className="text-2xl font-bold tabular-nums text-stone-900">{table.number}</p>
                      <p
                        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                          busy ? "text-red-800" : "text-emerald-800"
                        }`}
                      >
                        <HiOutlineUserGroup className="h-3.5 w-3.5" />
                        {table.capacity}
                      </p>
                      {busy && slots.length > 0 ? (
                        <div className="mt-1.5 w-full space-y-0.5">
                          {slots.slice(0, 2).map((slot) => (
                            <p
                              key={slot.id}
                              className="truncate text-[0.65rem] font-semibold tabular-nums leading-tight text-red-900/90"
                            >
                              {slot.timeRangeLabel}
                            </p>
                          ))}
                          {slots.length > 2 ? (
                            <p className="text-[0.6rem] text-red-800/70">+{slots.length - 2} más</p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-1.5 text-[0.65rem] font-medium text-emerald-800/80">Libre</p>
                      )}
                    </div>

                    {showTip && tipSlot ? (
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-44 -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-left text-xs shadow-lg shadow-stone-900/10">
                        <p className="font-semibold text-stone-900">Reserva #{tipSlot.id}</p>
                        <p className="mt-0.5 text-stone-600">{tipSlot.people} personas</p>
                        <p className="text-stone-600">
                          Duración: {formatDurationLabel(tipSlot.durationMinutes)}
                        </p>
                        {slots.length > 1 ? (
                          <p className="mt-1 text-[0.65rem] text-stone-400">
                            +{slots.length - 1} reserva(s) en esta franja
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4 border-t border-stone-100 pt-3 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Libre a esa hora
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-700" /> Ocupada
            </span>
            <span className="text-stone-400">Hover = código, personas y duración</span>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm shadow-stone-900/5 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-stone-900">Lista de reservas</h2>
            <p className="text-xs text-stone-500">{activeList.length} activas</p>
          </div>

          {reservations.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-10 text-center text-sm text-stone-500">
              No hay reservas este día. Pulsa «Nueva reserva» para crear una.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-100 text-[0.65rem] uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="pb-2 pr-3 font-semibold">Franja</th>
                    <th className="pb-2 pr-3 font-semibold">Cliente</th>
                    <th className="pb-2 pr-3 font-semibold">Mesa</th>
                    <th className="pb-2 pr-3 font-semibold">Pers.</th>
                    <th className="pb-2 pr-3 font-semibold">Estado</th>
                    <th className="pb-2 font-semibold"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="align-middle">
                      <td className="py-3 pr-3">
                        <p className="font-semibold tabular-nums text-stone-900">
                          {reservation.timeRangeLabel || reservation.time}
                        </p>
                        {reservation.durationMinutes ? (
                          <p className="text-[0.65rem] text-stone-500">
                            {formatDurationLabel(reservation.durationMinutes)}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-stone-800">{reservation.guestName}</p>
                        <p className="truncate text-xs text-stone-500">{reservation.guestEmail}</p>
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-stone-700">
                        {reservation.tableNumber ?? "—"}
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-stone-700">{reservation.people}</td>
                      <td className="py-3 pr-3">
                        <ReservationBadge status={reservation.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-2">
                          <StaffLink
                            href={`/staff/reservations/${reservation.id}`}
                            className="text-xs font-semibold text-red-800 hover:underline"
                          >
                            Ver
                          </StaffLink>
                          <button
                            type="button"
                            disabled={deletingId === reservation.id}
                            onClick={() => handleDelete(reservation.id)}
                            className="text-xs font-semibold text-stone-500 hover:text-red-800 disabled:opacity-50"
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <StaffNewReservationPopup
        isOpen={popupOpen}
        customers={customers}
        dishes={dishes}
        tables={tables}
        defaultDate={date}
        onCreated={() => {
          router.refresh();
        }}
        onClose={() => {
          setPopupOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
