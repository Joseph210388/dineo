"use client";

import { useState } from "react";
import { POST_KINDS, POST_STATUSES } from "../../lib/blog";
import BlogCoverField from "./blog-cover-field";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-cream px-3.5 py-2.5 text-sm text-stone-800 outline-none focus:border-red-700 focus:bg-white";

export default function BlogPostForm({ post = null, onSubmit, onCancel, saving = false, error = "" }) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [body, setBody] = useState(post?.body || "");
  const [kind, setKind] = useState(post?.kind || "news");
  const [status, setStatus] = useState(post?.status || "draft");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl || "");

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData();
    if (post?.id) data.set("id", post.id);
    data.set("title", title);
    data.set("slug", slug);
    data.set("excerpt", excerpt);
    data.set("body", body);
    data.set("kind", kind);
    data.set("status", status);
    data.set("coverImageUrl", coverImageUrl);
    onSubmit?.(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="thin-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-2">
        <div className="grid gap-4 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-medium text-stone-700">Portada</p>
            <div className="mt-1.5">
              <BlogCoverField value={coverImageUrl} onChange={setCoverImageUrl} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-stone-700">
              Título
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={fieldClass}
                placeholder="Menú del día, evento, promo…"
              />
            </label>

            <label className="block text-sm font-medium text-stone-700">
              Slug (URL)
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                className={fieldClass}
                placeholder="se-genera-solo-si-lo-dejas-vacío"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700">
                Tipo
                <select value={kind} onChange={(event) => setKind(event.target.value)} className={fieldClass}>
                  {POST_KINDS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Estado
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className={fieldClass}
                >
                  {POST_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-stone-700">
              Resumen corto
              <textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={2}
                maxLength={280}
                className={fieldClass}
                placeholder="Una o dos frases para la tarjeta del listado"
              />
            </label>
          </div>
        </div>

        <label className="block text-sm font-medium text-stone-700">
          Contenido
          <textarea
            required
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={10}
            className={`${fieldClass} min-h-[12rem] font-normal leading-relaxed`}
            placeholder="Escribe la noticia. Separa párrafos con una línea en blanco."
          />
        </label>
      </div>

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-stone-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-300 bg-cream px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
        >
          {saving ? "Guardando…" : post?.id ? "Guardar cambios" : "Crear entrada"}
        </button>
      </div>
    </form>
  );
}
