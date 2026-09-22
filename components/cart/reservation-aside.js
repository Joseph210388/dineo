"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineNewspaper,
  HiOutlinePhone,
} from "react-icons/hi";
import { listPublishedPosts } from "../../backend/actions/blog";
import { formatDate } from "../../backend/staff-format";
import { postKindLabel } from "../../lib/blog";
import { SITE } from "../../lib/site-info";

/**
 * Columna derecha del expediente: cómo llegar + últimas entradas del blog.
 */
export default function ReservationAside() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let alive = true;
    listPublishedPosts({ limit: 3 })
      .then((list) => {
        if (alive) setPosts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (alive) setPosts([]);
      });
    return () => {
      alive = false;
    };
  }, []);

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

      <section className="rounded-2xl border border-stone-200/90 bg-white px-4 py-4 shadow-sm shadow-stone-900/5 sm:px-5">
        <div className="flex items-start gap-2.5">
          <HiOutlineNewspaper className="mt-0.5 h-5 w-5 shrink-0 text-red-800" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-red-800/80">
              Del local
            </p>
            <h2 className="mt-1 text-base font-semibold text-stone-900">Notas y promociones</h2>

            {posts.length === 0 ? (
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                Cuando el equipo publique en el blog, las últimas entradas aparecerán aquí.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block rounded-xl border border-stone-100 bg-cream/50 px-3 py-2.5 transition hover:border-red-800/30"
                    >
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">
                        {postKindLabel(post.kind)} · {formatDate(post.publishedAt || post.createdAt)}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-stone-900">{post.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/blog"
              className="mt-3 inline-flex text-sm font-semibold text-red-800 hover:underline"
            >
              Ver todo el blog
            </Link>
          </div>
        </div>
      </section>
    </aside>
  );
}
