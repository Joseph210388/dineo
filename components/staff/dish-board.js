"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createDishAction, deleteDishAction, getStaffDish, updateDishAction } from "../../backend/actions/staff";
import { formatMoney } from "../../backend/staff-format";
import Popup from "../popup/popup";
import ConfirmPopup from "../popup/confirm-popup";
import SearchInput from "../search-input/search-input";
import Pagination from "../pagination/pagination";
import ViewToggle from "../view-toggle/view-toggle";
import DishForm from "./dish-form";
import { matchesSearch, MENU_PAGE_SIZE, TABLE_PAGE_SIZE } from "../../lib/search-text";
import { usePaginator } from "../../lib/use-paginator";

const VIEW_KEY = "taipei_staff_dishes_view";

export default function DishBoard({ dishes, catalogs }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("list");
  const [query, setQuery] = useState("");
  const [editingDish, setEditingDish] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dishToDelete, setDishToDelete] = useState(null);

  const filtered = useMemo(() => {
    return dishes.filter((dish) =>
      matchesSearch(`${dish.name} ${dish.category}`, query)
    );
  }, [dishes, query]);

  const pageSize = viewMode === "grid" ? MENU_PAGE_SIZE : TABLE_PAGE_SIZE;
  const page = usePaginator(filtered, pageSize);

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_KEY);
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  function changeView(nextView) {
    setViewMode(nextView);
    window.localStorage.setItem(VIEW_KEY, nextView);
  }

  function closeEditor() {
    setDishToDelete(null);
    setEditingDish(null);
    setIsCreating(false);
  }

  async function openDish(dish) {
    setIsCreating(false);
    const full = await getStaffDish(dish.id);
    setEditingDish(full || dish);
  }

  function handleSaved() {
    closeEditor();
    router.refresh();
  }

  async function handleDelete(dishId) {
    const data = new FormData();
    data.set("id", dishId);
    const result = await deleteDishAction(data);
    if (result?.ok) {
      closeEditor();
      router.refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <ViewToggle value={viewMode} onChange={changeView} />
        <button
          type="button"
          onClick={() => {
            setEditingDish(null);
            setIsCreating(true);
          }}
          className="inline-flex w-fit rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nuevo plato
        </button>
      </div>

      {dishes.length > 0 ? (
        <div className="mt-6 max-w-xl">
          <SearchInput
            value={query}
            onChange={setQuery}
            label="Buscar plato"
            placeholder="Nombre o categoría"
          />
          <p className="mt-2 text-sm text-stone-500">
            {page.total} coinciden · página {page.page} de {page.totalPages}
          </p>
        </div>
      ) : null}

      {dishes.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          No hay platillos. Crea el primero.
        </p>
      ) : page.total === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          Nada coincide. Prueba otro nombre o limpia la búsqueda.
        </p>
      ) : viewMode === "grid" ? (
        <div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.visible.map((dish) => (
            <button
              key={dish.id}
              type="button"
              onClick={() => openDish(dish)}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white text-left transition hover:border-red-700"
            >
              <img src={dish.image} alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="truncate font-medium text-stone-800">{dish.name}</p>
                <p className="mt-1 text-sm text-stone-500">{dish.category}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-sm text-stone-800">{formatMoney(dish.price)}</p>
                  <p className={`text-xs font-medium ${dish.isAvailable ? "text-emerald-700" : "text-stone-500"}`}>
                    {dish.isAvailable ? "En carta" : "Oculto"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <Pagination
          page={page.page}
          totalPages={page.totalPages}
          total={page.total}
          pageSize={page.pageSize}
          onPageChange={page.setPage}
        />
        </div>
      ) : (
        <div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="hidden grid-cols-[2fr_0.8fr_0.6fr_0.6fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 md:grid">
            <span>Plato</span>
            <span>Categoría</span>
            <span>Precio</span>
            <span>Estado</span>
          </div>
          <ul className="divide-y divide-stone-100">
            {page.visible.map((dish) => (
              <li key={dish.id}>
                <button
                  type="button"
                  onClick={() => openDish(dish)}
                  className="grid w-full grid-cols-1 gap-2 px-4 py-3 text-left transition hover:bg-stone-50 sm:px-5 md:grid-cols-[2fr_0.8fr_0.6fr_0.6fr] md:items-center md:gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={dish.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-800">{dish.name}</p>
                      <p className="truncate text-xs text-stone-500 md:hidden">{dish.category}</p>
                    </div>
                  </div>
                  <p className="hidden text-sm text-stone-600 md:block">{dish.category}</p>
                  <p className="text-sm text-stone-800">{formatMoney(dish.price)}</p>
                  <p className={`text-xs font-medium ${dish.isAvailable ? "text-emerald-700" : "text-stone-500"}`}>
                    {dish.isAvailable ? "En carta" : "Oculto"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Pagination
          page={page.page}
          totalPages={page.totalPages}
          total={page.total}
          pageSize={page.pageSize}
          onPageChange={page.setPage}
        />
        </div>
      )}

      <Popup
        isOpen={Boolean(editingDish) || isCreating}
        onClose={closeEditor}
        title={isCreating ? "Nuevo plato" : editingDish?.name || ""}
        showClose
        closePosition="bar"
        headerTone="brand"
        maxWidthClass="max-w-[min(72rem,96vw)]"
        panelBgClass="bg-cream"
        overflowMode="none"
        panelClassName="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-4 lg:px-8"
        listenEscape={!dishToDelete}
      >
        <DishForm
          key={editingDish?.id || "new"}
          action={isCreating ? createDishAction : updateDishAction}
          dish={isCreating ? null : editingDish}
          catalogs={catalogs}
          submitLabel={isCreating ? "Crear plato" : "Guardar cambios"}
          onSaved={handleSaved}
          onDelete={editingDish ? () => setDishToDelete(editingDish) : undefined}
        />
      </Popup>

      <ConfirmPopup
        isOpen={Boolean(dishToDelete)}
        title="¿Estás seguro de eliminar el siguiente plato?"
        description="Esta acción no se puede deshacer. Desaparecerá de la carta."
        itemName={dishToDelete?.name}
        itemImage={dishToDelete?.image}
        confirmLabel="Eliminar plato"
        onCancel={() => setDishToDelete(null)}
        onConfirm={() => handleDelete(dishToDelete.id)}
      />
    </div>
  );
}
