"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, formatMoney, formatTime } from "../../backend/staff-format";

const REDIRECT_SECONDS = 10;

/**
 * Paso 3: agradecimiento y redirección automática al historial de reservas.
 */
export default function ReservationSuccess({
  guestName = "",
  date = "",
  time = "",
  people = 0,
  total = 0,
  autoRedirect = true,
}) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const dateLabel = date ? formatDate(date) : "";
  const timeLabel = time ? formatTime(time) : "";

  useEffect(() => {
    if (!autoRedirect) {
      return undefined;
    }

    const tick = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    const redirect = window.setTimeout(() => {
      router.push("/reservation");
    }, REDIRECT_SECONDS * 1000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(redirect);
    };
  }, [autoRedirect, router]);

  return (
    <div className="flex min-h-[min(70svh,36rem)] flex-col items-center justify-center px-[4%] py-12 sm:py-16 md:px-[6%] lg:px-[8%]">
      <div className="w-full max-w-lg text-center">
        <p className="text-[clamp(2.75rem,8vw,4rem)] leading-none" aria-hidden>
          😊
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-800/80">
          Taipei
        </p>
        <h1 className="mt-2 text-[clamp(1.65rem,4vw,2.35rem)] font-semibold leading-tight text-stone-900">
          ¡Muchas gracias por tu reserva!
        </h1>
        <p className="mt-3 text-base text-stone-600 sm:text-lg">
          Disfruta tu comida cuando vengas
          {guestName ? (
            <>
              , <span className="font-semibold text-stone-800">{guestName}</span>
            </>
          ) : null}
          . Te esperamos en mesa.
        </p>

        {(dateLabel || timeLabel || people || total > 0) && (
          <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-stone-200/90 bg-white/80 px-4 py-4 text-left shadow-sm shadow-stone-900/5 sm:grid-cols-4 sm:gap-2 sm:px-5">
            {dateLabel ? (
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">Fecha</p>
                <p className="mt-0.5 text-sm font-semibold text-stone-900">{dateLabel}</p>
              </div>
            ) : null}
            {timeLabel ? (
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">Hora</p>
                <p className="mt-0.5 text-sm font-semibold text-stone-900">{timeLabel}</p>
              </div>
            ) : null}
            {people ? (
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">Personas</p>
                <p className="mt-0.5 text-sm font-semibold text-stone-900">{people}</p>
              </div>
            ) : null}
            {total > 0 ? (
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">Total</p>
                <p className="mt-0.5 text-sm font-semibold text-stone-900">{formatMoney(total)}</p>
              </div>
            ) : null}
          </div>
        )}

        {autoRedirect ? (
          <p className="mt-6 text-sm text-stone-500">
            En <span className="font-semibold text-stone-800">{secondsLeft}</span> segundos irás al
            historial de reservas…
          </p>
        ) : null}

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:mx-auto sm:max-w-sm">
          <Link
            href="/reservation"
            className="inline-flex w-full items-center justify-center rounded-xl bg-red-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-red-900 sm:text-base"
          >
            Ir al historial ahora
          </Link>
          <Link
            href="/food"
            className="inline-flex w-full items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
          >
            Volver a comprar
          </Link>
        </div>
      </div>
    </div>
  );
}
