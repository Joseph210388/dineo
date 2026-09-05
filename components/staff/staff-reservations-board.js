"use client";

import { useMemo, useState } from "react";
import StaffLink from "./staff-link";
import SearchInput from "../search-input/search-input";
import ShowMoreButton from "../show-more-button/show-more-button";
import { ReservationBadge } from "./status-badge";
import { formatDate, formatMoney, paymentMethodLabel } from "../../backend/staff-format";
import { matchesSearch, STAFF_RESERVATIONS_FETCH_LIMIT, TABLE_PAGE_SIZE } from "../../lib/search-text";
import { usePagedList } from "../../lib/use-paged-list";

const STATUSES = [
  { id: "", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "confirmed", label: "Confirmadas" },
  { id: "completed", label: "Completadas" },
  { id: "cancelled", label: "Canceladas" },
];

export default function StaffReservationsBoard({ reservations }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    return reservations.filter((reservation) => {
      if (status && reservation.status !== status) {
        return false;
      }
      return matchesSearch(
        `${reservation.guestName} ${reservation.guestEmail} ${reservation.date}`,
        query
      );
    });
  }, [query, reservations, status]);

  const page = usePagedList(filtered, TABLE_PAGE_SIZE);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-stone-900">Listado</h2>
          <p className="mt-1 text-sm text-stone-500">
            {page.total} coinciden · se ven {page.visible.length}
            {reservations.length >= STAFF_RESERVATIONS_FETCH_LIMIT
              ? ` · últimas ${STAFF_RESERVATIONS_FETCH_LIMIT}`
              : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 max-w-xl">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Buscar reserva"
          placeholder="Cliente, correo o fecha"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUSES.map((item) => (
          <button
            key={item.id || "all"}
            type="button"
            onClick={() => setStatus(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === item.id
                ? "bg-red-700 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-red-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {page.total === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
          Nada coincide. Prueba otro nombre o quita el filtro.
        </p>
      ) : (
        <div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="hidden grid-cols-[1.3fr_1fr_0.7fr_0.6fr_0.7fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 lg:grid">
              <span>Cliente</span>
              <span>Fecha</span>
              <span>Pago</span>
              <span>Total</span>
              <span>Estado</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {page.visible.map((reservation) => (
                <li key={reservation.id}>
                  <StaffLink
                    href={`/staff/reservations/${reservation.id}`}
                    className="grid grid-cols-1 gap-2 px-4 py-3 transition hover:bg-stone-50 sm:px-5 lg:grid-cols-[1.3fr_1fr_0.7fr_0.6fr_0.7fr] lg:items-center lg:gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-800">{reservation.guestName}</p>
                      <p className="truncate text-xs text-stone-500">{reservation.guestEmail}</p>
                    </div>
                    <p className="text-sm text-stone-600">
                      {formatDate(reservation.date)} · {reservation.time} · {reservation.people} pers.
                    </p>
                    <p className="text-sm text-stone-600">{paymentMethodLabel(reservation.paymentMethod)}</p>
                    <p className="text-sm font-medium text-stone-800">{formatMoney(reservation.total)}</p>
                    <ReservationBadge status={reservation.status} />
                  </StaffLink>
                </li>
              ))}
            </ul>
          </div>
          <ShowMoreButton remaining={page.remaining} onClick={page.showMore} />
        </div>
      )}
    </section>
  );
}
