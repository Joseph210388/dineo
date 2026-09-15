"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCatalogItemAction,
  deleteCatalogItemAction,
  updateCatalogItemAction,
} from "../../backend/actions/staff";
import SearchInput from "../search-input/search-input";
import ShowMoreButton from "../show-more-button/show-more-button";
import { matchesSearch, TABLE_PAGE_SIZE } from "../../lib/search-text";
import { usePagedList } from "../../lib/use-paged-list";

export default function CatalogManager({
  kind,
  title,
  description,
  items,
  variant = "page",
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [query, setQuery] = useState("");
  const isPanel = variant === "panel";

  const filtered = useMemo(() => {
    return items.filter((item) => matchesSearch(item.name, query));
  }, [items, query]);

  const page = usePagedList(filtered, TABLE_PAGE_SIZE);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    const data = new FormData();
    data.set("kind", kind);
    data.set("name", name);
    const result = await createCatalogItemAction(data);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setName("");
    router.refresh();
  }

  async function handleUpdate(event) {
    event.preventDefault();
    const data = new FormData();
    data.set("kind", kind);
    data.set("id", editingId);
    data.set("name", editingName);
    const result = await updateCatalogItemAction(data);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setEditingId("");
    setEditingName("");
    router.refresh();
  }

  async function handleDelete(id) {
    const confirmMessage =
      kind === "category"
        ? "¿Eliminar esta categoría? Solo se puede si ningún plato la usa."
        : "¿Eliminarlo del catálogo? Se quitará de los platos que lo usen.";
    if (!window.confirm(confirmMessage)) {
      return;
    }
    setError("");
    const data = new FormData();
    data.set("kind", kind);
    data.set("id", id);
    const result = await deleteCatalogItemAction(data);
    if (result && result.ok === false) {
      setError(result.message);
      return;
    }
    router.refresh();
  }

  const shellClass = isPanel
    ? "flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 sm:px-5"
    : "mx-auto w-full max-w-3xl";

  const formClass = isPanel
    ? "flex flex-col gap-2 rounded-xl border border-stone-200 bg-cream p-3 sm:flex-row"
    : "mt-6 flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row";

  const listClass = isPanel
    ? "thin-scrollbar min-h-0 flex-1 divide-y divide-stone-100 overflow-y-auto rounded-xl border border-stone-200 bg-cream"
    : "mt-6 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white";

  const itemPad = isPanel ? "px-3 py-2.5" : "px-4 py-3";

  return (
    <div className={shellClass}>
      {!isPanel ? (
        <>
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">{title}</h1>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </>
      ) : description ? (
        <p className="text-sm text-stone-500">{description}</p>
      ) : null}

      <form onSubmit={handleCreate} className={formClass}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre nuevo"
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15"
          required
        />
        <button type="submit" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
          Crear
        </button>
      </form>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {items.length > 0 ? (
        <div className={isPanel ? "max-w-full" : "mt-6 max-w-xl"}>
          <SearchInput
            value={query}
            onChange={setQuery}
            label={`Buscar ${title.toLowerCase()}`}
            placeholder="Nombre"
          />
          <p className="mt-2 text-sm text-stone-500">
            {page.total} coinciden · se ven {page.visible.length}
          </p>
        </div>
      ) : null}

      <ul className={listClass}>
        {page.total ? (
          page.visible.map((item) => (
            <li
              key={item.id}
              className={`flex flex-col gap-2 ${itemPad} sm:flex-row sm:items-center sm:justify-between`}
            >
              {editingId === item.id ? (
                <form onSubmit={handleUpdate} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-red-700"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-lg bg-red-700 px-3 py-2 text-sm text-white">
                      Guardar
                    </button>
                    <button type="button" onClick={() => setEditingId("")} className="rounded-lg border px-3 py-2 text-sm">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-medium text-stone-800">{item.name}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(item.name);
                      }}
                      className="text-sm text-red-700 hover:underline"
                    >
                      Editar
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="text-sm text-stone-500 hover:text-red-700">
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        ) : (
          <li className={`${itemPad} py-8 text-center text-sm text-stone-500`}>
            {items.length ? "Nada coincide con esa búsqueda." : "Todavía no hay ninguno."}
          </li>
        )}
      </ul>
      <ShowMoreButton remaining={page.remaining} onClick={page.showMore} />
    </div>
  );
}
