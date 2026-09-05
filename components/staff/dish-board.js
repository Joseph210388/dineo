"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDishAction, deleteDishAction, updateDishAction } from "../../backend/actions/staff";
import { formatMoney } from "../../backend/staff-format";
import Popup from "../popup/popup";
import ConfirmPopup from "../popup/confirm-popup";
import ViewToggle from "../view-toggle/view-toggle";
import DishForm from "./dish-form";

const VIEW_KEY = "taipei_staff_dishes_view";

export default function DishBoard({ dishes, catalogs }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("list");
  const [editingDish, setEditingDish] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dishToDelete, setDishToDelete] = useState(null);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Carta</h1>
          <p className="mt-1 text-sm text-stone-500">Edita en un popup. Relaciona ingredientes y alérgenos del catálogo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
      </div>

      {dishes.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          No hay platillos. Crea el primero.
        </p>
      ) : viewMode === "grid" ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dishes.map((dish) => (
            <button
              key={dish.id}
              type="button"
              onClick={() => setEditingDish(dish)}
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
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="hidden grid-cols-[2fr_0.8fr_0.6fr_0.6fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 md:grid">
            <span>Plato</span>
            <span>Categoría</span>
            <span>Precio</span>
            <span>Estado</span>
          </div>
          <ul className="divide-y divide-stone-100">
            {dishes.map((dish) => (
              <li key={dish.id}>
                <button
                  type="button"
                  onClick={() => setEditingDish(dish)}
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
      )}

      <Popup
        isOpen={Boolean(editingDish) || isCreating}
        onClose={closeEditor}
        showClose
        closePosition="bar"
        maxWidthClass="max-w-3xl"
        panelClassName="px-5 pb-6 pt-4 sm:px-7 sm:pb-7"
        listenEscape={!dishToDelete}
      >
        <div className="mb-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-red-700">Carta</p>
          <h2 className="text-[clamp(1.2rem,3vw,1.6rem)] font-semibold text-stone-900">
            {isCreating ? "Nuevo plato" : editingDish?.name}
          </h2>
        </div>
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
