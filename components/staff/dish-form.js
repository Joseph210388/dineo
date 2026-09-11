"use client";

import { useState } from "react";
import MultiSelectField from "./multi-select-field";
import DishImageEditor from "./dish-image-editor";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-cream px-3.5 py-2.5 text-sm text-stone-800 outline-none ring-red-700/15 transition placeholder:text-stone-400 focus:border-red-700 focus:bg-white focus:ring-4";

function Field({ label, className = "", children }) {
  return (
    <label className={`block text-sm font-medium text-stone-700 ${className}`.trim()}>
      {label}
      {children}
    </label>
  );
}

export default function DishForm({ action, dish, catalogs, submitLabel, onSaved, onDelete }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    if (!String(data.get("imageUrl") || "").trim()) {
      setError("Añade al menos una foto (subir o URL)");
      return;
    }

    setIsSubmitting(true);
    const result = await action(data);
    setIsSubmitting(false);

    if (!result?.ok) {
      setError(result?.message || "No se pudo guardar");
      return;
    }

    onSaved?.(result);
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      {dish ? <input type="hidden" name="id" value={dish.id} /> : null}

      <div className="thin-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-2">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.9fr)] lg:items-start">
          <div className="grid gap-3 rounded-2xl border border-stone-200/90 bg-stone-50/90 p-3 sm:grid-cols-2 sm:p-4">
            <Field label="Nombre" className="sm:col-span-2">
              <input className={inputClass} name="name" defaultValue={dish?.name || ""} required />
            </Field>

            <Field label="Categoría">
              {(catalogs?.categories || []).length ? (
                <select
                  className={inputClass}
                  name="category"
                  defaultValue={dish?.category || ""}
                  required
                >
                  <option value="" disabled>
                    Elige una categoría
                  </option>
                  {(catalogs?.categories || []).map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1.5 rounded-xl border border-dashed border-stone-300 bg-cream px-3 py-3 text-sm text-stone-500">
                  Primero crea categorías en{" "}
                  <a href="/staff/categories" className="font-medium text-red-800 underline-offset-2 hover:underline">
                    su tabla
                  </a>
                  .
                </p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio (€)">
                <input
                  className={inputClass}
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={dish?.price ?? ""}
                  required
                />
              </Field>
              <Field label="Stock">
                <input
                  className={inputClass}
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={dish?.stock ?? 0}
                />
              </Field>
            </div>

            <Field label="Descripción" className="sm:col-span-2">
              <textarea
                className={`${inputClass} h-48 max-h-48 resize-none overflow-y-auto`}
                name="description"
                defaultValue={dish?.description || ""}
                maxLength={280}
                required
              />
            </Field>

            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
              <MultiSelectField
                name="ingredientIds"
                label="Ingredientes"
                options={catalogs?.ingredients || []}
                selectedIds={dish?.ingredientIds || []}
                catalogHref="/staff/ingredients"
                emptyText="Aún no hay ingredientes. Créalos en la tabla de ingredientes."
                placeholder="Seleccionar ingredientes…"
              />
              <MultiSelectField
                name="allergenIds"
                label="Alérgenos"
                options={catalogs?.allergens || []}
                selectedIds={dish?.allergenIds || []}
                catalogHref="/staff/allergens"
                emptyText="Aún no hay alérgenos. Créalos en la tabla de alérgenos."
                placeholder="Seleccionar alérgenos…"
              />
            </div>
          </div>

          <aside className="flex flex-col gap-3 rounded-2xl border border-stone-300/70 bg-stone-200/40 p-3 sm:p-4">
            <p className="text-sm font-medium text-stone-700">Fotos</p>
            <DishImageEditor
              key={dish?.id || "new"}
              mainImage={dish?.image || ""}
              extraImages={dish?.extraImages || []}
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-300/80 bg-cream px-3 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={dish ? dish.isAvailable : true}
                className="checkbox-red mt-0.5"
              />
              <span>
                <span className="block font-medium text-stone-800">Visible en la carta</span>
                <span className="mt-0.5 block text-xs text-stone-500">
                  Si lo quitas, el comensal no lo verá en Comida.
                </span>
              </span>
            </label>
          </aside>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="mt-1 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-300/70 px-0 pt-4">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-red-300/80 bg-cream px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-50"
          >
            Eliminar platillo
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-red-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-900 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
