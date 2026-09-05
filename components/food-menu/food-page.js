"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../auth-provider";
import Slider from "../slider/slider";
import DishCard, { DISH_CARD_GRID_CLASS } from "../dishcard/dishcard";
import DishCatalog from "../dish-popup/dish-catalog";
import FoodFilters from "./food-filters";
import FilterChipList from "../filter-chip/filter-chip";
import ViewToggle from "../view-toggle/view-toggle";
import { PRICE_ORDERS } from "../../lib/filter-dishes";
import { isStaffRole } from "../../lib/roles";
import { useDishFilters } from "../../lib/use-dish-filters";

const VIEW_STORAGE_KEY = "taipei_food_view";

export default function FoodPage({ dishes }) {
  const { user } = useAuth();
  const customer = user && !isStaffRole(user.role) ? user : null;
  const [fechaActual] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("grid");
  const filters = useDishFilters(dishes);

  useEffect(() => {
    const savedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
  }, []);

  function changeView(nextView) {
    setViewMode(nextView);
    window.localStorage.setItem(VIEW_STORAGE_KEY, nextView);
  }

  return (
    <section className="flex-1 bg-cream">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-5 md:px-6 md:py-8 lg:px-8">
        <Slider />

        <header className="mt-5 text-center md:mt-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-red-800">
            Cocina peruana
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="h-px flex-1 bg-red-800/40" />
            <h1 className="max-w-[18ch] text-[clamp(1.5rem,4vw,2.25rem)] font-semibold leading-tight text-stone-900 sm:max-w-none">
              Selecciona tus platillos
              {customer ? (
                <span className="text-red-800">
                  {" "}
                  {customer.firstName} {customer.lastName}
                </span>
              ) : null}
            </h1>
            <span className="h-px flex-1 bg-red-800/40" />
          </div>
          <p className="mt-3 text-sm capitalize text-stone-600 sm:text-base">
            Hoy · {format(fechaActual, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </header>

        <div className="mt-6 flex flex-col gap-5 lg:mt-8 lg:flex-row lg:items-start lg:gap-6">
          <FoodFilters
            dishes={dishes}
            categoryOptions={filters.categoryOptions}
            query={filters.query}
            categories={filters.categories}
            types={filters.types}
            areOpen={filters.areFiltersOpen}
            onToggle={() => filters.setAreFiltersOpen((open) => !open)}
            onQueryChange={filters.setQuery}
            onToggleCategory={filters.onToggleCategory}
            onToggleType={filters.onToggleType}
            onRemoveTag={filters.removeTag}
            onClear={filters.clearFilters}
            tags={filters.tags}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:mb-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[clamp(1.2rem,3vw,1.5rem)] font-semibold text-stone-900">
                    Platillos disponibles
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {filters.visibleDishes.length} de {dishes.length} en la mesa
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor="food-sort">
                    Ordenar
                  </label>
                  <select
                    id="food-sort"
                    value={filters.order}
                    onChange={(event) => filters.setOrder(event.target.value)}
                    className="min-h-10 max-w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/15 sm:text-sm"
                  >
                    {PRICE_ORDERS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ViewToggle value={viewMode} onChange={changeView} />
                </div>
              </div>

              <div className="hidden lg:block">
                <FilterChipList
                  tags={filters.tags}
                  onRemove={filters.removeTag}
                  onClear={filters.tags.length ? filters.clearFilters : undefined}
                />
              </div>

              {!customer ? (
                <p className="text-sm text-stone-500">
                  Mira la carta sin cuenta. Para pedir, entra o regístrate.
                </p>
              ) : null}
            </div>

            <DishCatalog dishes={dishes}>
              {(openDish) =>
                filters.visibleDishes.length ? (
                  <div
                    className={
                      viewMode === "list" ? "grid grid-cols-1 gap-3" : DISH_CARD_GRID_CLASS
                    }
                  >
                    {filters.visibleDishes.map((dish) => (
                      <DishCard key={dish._id} dish={dish} onOpen={openDish} variant={viewMode} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-red-900/20 bg-white/70 px-6 py-14 text-center">
                    <p className="text-lg font-semibold text-stone-800">Hoy no encontramos ese antojo</p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                      Prueba otro nombre, cambia de categoría o limpia los filtros para volver a toda la carta.
                    </p>
                    <button
                      type="button"
                      onClick={filters.clearFilters}
                      className="mt-5 rounded-2xl bg-red-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-900"
                    >
                      Ver toda la carta
                    </button>
                  </div>
                )
              }
            </DishCatalog>
          </div>
        </div>
      </div>
    </section>
  );
}
