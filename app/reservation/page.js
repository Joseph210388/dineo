"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HiOutlinePhone, HiOutlineShieldCheck } from "react-icons/hi";
import { useAuth } from "../../components/auth-provider";
import { getReservationsByUser } from "../../backend/actions/reservation";
import { formatDate, formatMoney, formatTime } from "../../backend/staff-format";
import { paymentMethodLabel } from "../../lib/payment-methods";
import {
  dietaryDescription,
  dietaryLabel,
  tableTypeDescription,
  tableTypeLabel,
} from "../../lib/reservation-preferences";
import { SITE } from "../../lib/site-info";
import ReservationAside from "../../components/cart/reservation-aside";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function guestNameFromNotes(notes, fallback) {
  const match = String(notes || "").match(/A nombre de:\s*([^·]+)/i);
  return match?.[1]?.trim() || fallback;
}

function ReservationCard({ reservation, guestFallback, tone = "upcoming" }) {
  const guest = guestNameFromNotes(reservation.notes, guestFallback);
  const isUpcoming = tone === "upcoming";

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm shadow-stone-900/5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Comprobante de reserva
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-stone-900">
            #{String(reservation._id).padStart(4, "0")}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
            {reservation.status === "cancelled"
              ? "Cancelada"
              : reservation.status === "completed"
                ? "Completada"
                : "Confirmada"}
          </span>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
            {isUpcoming ? "Próxima" : "Histórico"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-3 sm:px-5">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">Titular</p>
          <p className="mt-1 text-sm font-semibold text-stone-900">{guest}</p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">
            Fecha y horario
          </p>
          <p className="mt-1 text-sm font-semibold text-red-900">
            {formatDate(reservation.reservationDate)} · {formatTime(reservation.reservationTime)}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">
            Capacidad
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-900">
            {reservation.numberOfPeople}{" "}
            {reservation.numberOfPeople === 1 ? "persona" : "personas"}
          </p>
        </div>
      </div>

      <div className="border-t border-stone-100 px-4 py-4 sm:px-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">
          Desglose del pedido
        </p>
        <ul className="mt-2 divide-y divide-stone-100">
          {(reservation.dishDetail || []).map((dish, index) => (
            <li key={`${reservation._id}-${index}`} className="flex items-center justify-between gap-3 py-2">
              <p className="min-w-0 text-sm text-stone-800">
                <span className="font-semibold text-stone-500">{dish.quantity}×</span> {dish.dishName}
              </p>
              {dish.unitPrice != null ? (
                <p className="shrink-0 text-sm font-semibold tabular-nums text-stone-900">
                  {formatMoney(dish.unitPrice * dish.quantity)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 border-t border-stone-100 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <div className="rounded-xl border border-stone-200/80 bg-cream/60 px-3 py-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-red-800/80">
            Mesa
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-900">
            {tableTypeLabel(reservation.tableType)}
          </p>
          {tableTypeDescription(reservation.tableType) ? (
            <p className="mt-0.5 text-xs text-stone-500">
              {tableTypeDescription(reservation.tableType)}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-cream/60 px-3 py-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-red-800/80">
            Dietética
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-900">
            {dietaryLabel(reservation.dietaryNote)}
          </p>
          {dietaryDescription(reservation.dietaryNote) ? (
            <p className="mt-0.5 text-xs text-stone-500">
              {dietaryDescription(reservation.dietaryNote)}
            </p>
          ) : null}
        </div>
        {reservation.kitchenNote ? (
          <div className="rounded-xl border border-stone-200/80 bg-cream/60 px-3 py-3 sm:col-span-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-red-800/80">
              Nota para cocina
            </p>
            <p className="mt-1 text-sm text-stone-800">{reservation.kitchenNote}</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-stone-100 bg-stone-50/80 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">Pago</p>
          <p className="mt-0.5 text-sm font-medium text-stone-800">
            {paymentMethodLabel(reservation.paymentMethod)}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-right">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">Total</p>
          <p className="text-lg font-bold text-red-900">{formatMoney(reservation.total_price)}</p>
        </div>
      </div>
    </article>
  );
}

export default function Reservation() {
  const { user, isLoaded } = useAuth();
  const userId = user?.id;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  const guestFallback = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Cliente",
    [user?.firstName, user?.lastName]
  );

  useEffect(() => {
    async function fetchReservations() {
      setLoading(true);
      try {
        const list = await getReservationsByUser();
        setReservations(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error al obtener las reservas del usuario:", error);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchReservations();
    } else if (isLoaded) {
      setLoading(false);
      setReservations([]);
    }
  }, [userId, isLoaded]);

  const today = todayISO();
  const upcoming = useMemo(
    () =>
      reservations.filter(
        (item) =>
          item.reservationDate >= today &&
          item.status !== "cancelled" &&
          item.status !== "completed"
      ),
    [reservations, today]
  );
  const history = useMemo(
    () =>
      reservations.filter(
        (item) =>
          item.reservationDate < today ||
          item.status === "cancelled" ||
          item.status === "completed"
      ),
    [reservations, today]
  );

  const visible = tab === "upcoming" ? upcoming : history;

  if (isLoaded && !user) {
    return (
      <div className="bg-cream px-[4%] py-16 text-center md:px-[6%]">
        <h1 className="text-2xl font-semibold text-stone-900">Tus reservas</h1>
        <p className="mt-2 text-stone-600">Inicia sesión para ver próximas reservas e historial.</p>
        <Link
          href="/food"
          className="mt-6 inline-flex rounded-xl bg-red-800 px-5 py-3 text-sm font-semibold text-white hover:bg-red-900"
        >
          Ir a la carta
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100svh-8rem)] px-[4%] py-8 sm:py-10 md:px-[5%] lg:px-[4%] xl:px-[3%]">
      <header className="w-full">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-800/80">
          Expediente gastronómico · Taipei
        </p>
        <h1 className="mt-2 text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold leading-tight text-stone-900">
          Reservas de <span className="text-red-900">{guestFallback}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 sm:text-base">
          Próximas experiencias desde hoy e historial de visitas. Incluye mesa y dietética
          indicadas en la reserva.
        </p>
      </header>

      <div className="mt-6 flex w-full flex-col gap-3 rounded-2xl border border-red-800/20 bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-2.5">
          <HiOutlineShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-800" aria-hidden />
          <p className="text-sm text-stone-600">
            Política de garantía: una vez confirmada, la reserva no se puede editar desde la web.
            Si necesitas ayuda, llama a recepción.
          </p>
        </div>
        <a
          href={`tel:${SITE.phone}`}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-red-800/30 bg-cream px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-900 transition hover:bg-red-50"
        >
          <HiOutlinePhone className="h-4 w-4" aria-hidden />
          Llamar a recepción
        </a>
      </div>

      <div className="mt-8 grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] xl:gap-8">
        <div className="min-w-0">
          <div className="border-b border-stone-200">
            <nav className="flex gap-1 sm:gap-4" aria-label="Secciones de reservas">
              <button
                type="button"
                onClick={() => setTab("upcoming")}
                className={`border-b-2 px-2 pb-3 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                  tab === "upcoming"
                    ? "border-red-800 text-red-900"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                Próximas reservas ({upcoming.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("history")}
                className={`border-b-2 px-2 pb-3 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                  tab === "history"
                    ? "border-red-800 text-red-900"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                Histórico ({history.length})
              </button>
            </nav>
          </div>

          <div className="mt-6 space-y-5">
            {loading ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-10 text-center text-sm text-stone-500">
                Cargando reservas…
              </p>
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-12 text-center">
                <p className="text-sm text-stone-500">
                  {tab === "upcoming"
                    ? "No tienes próximas reservas desde hoy."
                    : "Aún no hay visitas en el historial."}
                </p>
                <Link
                  href="/food"
                  className="mt-4 inline-flex rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
                >
                  Reservar desde la carta
                </Link>
              </div>
            ) : (
              visible.map((reservation) => (
                <ReservationCard
                  key={reservation._id}
                  reservation={reservation}
                  guestFallback={guestFallback}
                  tone={tab === "upcoming" ? "upcoming" : "history"}
                />
              ))
            )}
          </div>
        </div>

        <ReservationAside />
      </div>
    </div>
  );
}
