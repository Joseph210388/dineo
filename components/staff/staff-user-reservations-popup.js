"use client";

import { useEffect, useState } from "react";
import { listStaffUserReservations } from "../../backend/actions/staff";
import { formatDate, formatMoney, formatTime, paymentMethodLabel } from "../../backend/staff-format";
import Popup from "../popup/popup";
import { ReservationBadge } from "./status-badge";

export default function StaffUserReservationsPopup({ user, isOpen, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !user?.id) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    listStaffUserReservations(user.id)
      .then((list) => {
        if (!cancelled) {
          setRows(list || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudieron cargar las reservas");
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, user?.id]);

  const title = user
    ? `Reservas · ${`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}`
    : "Reservas";

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showClose
      closePosition="bar"
      headerTone="brand"
      maxWidthClass="max-w-[min(64rem,96vw)]"
      panelBgClass="bg-cream"
      overflowMode="none"
      panelClassName="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-4 lg:px-8"
      zClass="z-[85]"
    >
      <div className="thin-scrollbar max-h-[min(70svh,32rem)] min-h-0 overflow-y-auto">
        {loading ? (
          <p className="py-8 text-center text-sm text-stone-500">Cargando reservas…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-700">{error}</p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-10 text-center text-sm text-stone-500">
            Este cliente aún no tiene reservas.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white">
            <div className="hidden grid-cols-[0.9fr_0.6fr_0.5fr_0.7fr_0.8fr_0.9fr] gap-2 border-b border-stone-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 lg:grid">
              <span>Fecha</span>
              <span>Hora</span>
              <span>Pers.</span>
              <span>Total</span>
              <span>Estado</span>
              <span>Pago</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-2 lg:grid-cols-[0.9fr_0.6fr_0.5fr_0.7fr_0.8fr_0.9fr] lg:items-center lg:gap-2"
                >
                  <p className="text-sm font-medium text-stone-800">{formatDate(row.date)}</p>
                  <p className="text-sm text-stone-600">{formatTime(row.time)}</p>
                  <p className="text-sm text-stone-600">{row.people}</p>
                  <p className="text-sm font-semibold text-stone-900">{formatMoney(row.total)}</p>
                  <ReservationBadge status={row.status} />
                  <p className="text-xs text-stone-500">{paymentMethodLabel(row.paymentMethod)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Popup>
  );
}
