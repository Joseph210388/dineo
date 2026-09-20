"use client";

import {
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineNewspaper,
  HiOutlinePhone,
} from "react-icons/hi";
import { SITE } from "../../lib/site-info";

/**
 * Columna derecha del expediente: cómo llegar + hueco para notas/promos del local.
 */
export default function ReservationAside() {
  return (
    <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:w-full">
      <section className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm shadow-stone-900/5">
        <div className="border-b border-stone-100 px-4 py-3 sm:px-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-red-800/80">
            Ubicación
          </p>
          <h2 className="mt-1 text-base font-semibold text-stone-900">Cómo llegar a {SITE.name}</h2>
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5">
          <div className="flex gap-2.5">
            <HiOutlineLocationMarker className="mt-0.5 h-5 w-5 shrink-0 text-red-800" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900">{SITE.address}</p>
              <p className="text-xs text-stone-500">{SITE.city}</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <HiOutlineClock className="mt-0.5 h-5 w-5 shrink-0 text-red-800" aria-hidden />
            <div>
              <p className="text-sm font-medium text-stone-800">{SITE.hours}</p>
              <p className="text-xs text-stone-500">Horario orientativo del comedor</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <HiOutlinePhone className="mt-0.5 h-5 w-5 shrink-0 text-red-800" aria-hidden />
            <div>
              <a href={`tel:${SITE.phone}`} className="text-sm font-medium text-stone-800 hover:text-red-900">
                {SITE.phone}
              </a>
              <p className="text-xs text-stone-500">Recepción · {SITE.mobile}</p>
            </div>
          </div>

          {/* Mapa estático/enlace: sin API de mapas en la demo */}
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-1 block overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
          >
            <div
              className="flex h-36 w-full items-end bg-[linear-gradient(145deg,#e7e5e4_0%,#d6d3d1_45%,#f5f5f4_100%)] p-3 sm:h-40"
              aria-hidden
            >
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-red-900 shadow-sm">
                <HiOutlineLocationMarker className="h-3.5 w-3.5" />
                Ver en el mapa
              </span>
            </div>
            <span className="sr-only">Abrir ubicación de {SITE.name} en Google Maps</span>
          </a>

          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-900"
          >
            Cómo llegar
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-2.5">
          <HiOutlineNewspaper className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" aria-hidden />
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Del local
            </p>
            <h2 className="mt-1 text-base font-semibold text-stone-800">Notas y promociones</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Próximamente el equipo de Taipei podrá publicar aquí avisos del local, notas de
              platos de temporada y promociones. Aún no está conectado a la base de datos.
            </p>
            <p className="mt-3 inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">
              Próximamente
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
