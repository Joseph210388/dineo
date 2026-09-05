"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../auth-provider";
import DishCard, { DISH_CARD_GRID_CLASS } from "../dishcard/dishcard";
import DishCatalog from "../dish-popup/dish-catalog";
import FoodFilters from "../food-menu/food-filters";
import FilterChipList from "../filter-chip/filter-chip";
import ViewToggle from "../view-toggle/view-toggle";
import { FAVORITES_CHANGED_EVENT, readFavorites } from "../../lib/favorites";
import { PRICE_ORDERS } from "../../lib/filter-dishes";
import { useDishFilters } from "../../lib/use-dish-filters";

const VIEW_STORAGE_KEY = "taipei_favorites_view";

export default function FavoritesPage({ dishes }) {
  const { user, isLoaded } = useAuth();
  const [viewMode, setViewMode] = useState("grid");
  const [favoritesRevision, setFavoritesRevision] = useState(0);

  useEffect(() => {
    function refreshFavorites() {
      setFavoritesRevision((current) => current + 1);
    }

    window.addEventListener(FAVORITES_CHANGED_EVENT, refreshFavorites);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, refreshFavorites);
  }, []);

  const favoriteDishes = useMemo(() => {
    if (!isLoaded || !user) {
      return [];
    }

    const ids = new Set(readFavorites(user.id).map(String));
    return dishes.filter((dish) => ids.has(String(dish.id)) || ids.has(String(dish._id)));
  }, [dishes, favoritesRevision, isLoaded, user]);

  const filters = useDishFilters(favoriteDishes);

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
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-5 md:px-6 md:py-10 lg:px-8">
        <header className="mb-6 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-red-800">Tu mesa</p>
          <h1 className="mt-2 text-[clamp(1.5rem,4vw,2.1rem)] font-semibold text-stone-900">Favoritos</h1>
          <p className="mt-2 text-sm text-stone-500">Los platos que has marcado para volver a ellos.</p>
        </header>

        {!isLoaded ? (
          <p className="text-center text-sm text-stone-500">Cargando tus favoritos...</p>
        ) : !favoriteDishes.length ? (
          <div className="rounded-2xl border border-dashed border-red-900/20 bg-white/70 px-6 py-14 text-center">
            <p className="text-lg font-semibold text-stone-800">Aún no hay favoritos</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
              Abre un plato en la carta y toca el corazón para guardarlo aquí.
            </p>
            <Link
              href="/food"
              className="mt-5 inline-block rounded-2xl bg-red-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-900"
            >
              Ir a la carta
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
            <FoodFilters
              dishes={favoriteDishes}
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
              kicker="Tu mesa"
              heading="Cómo quieres verlos"
            />

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-col gap-3 sm:mb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-[clamp(1.2rem,3vw,1.5rem)] font-semibold text-stone-900">
                      Tus platillos
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {filters.visibleDishes.length} de {favoriteDishes.length} guardados
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor="favorites-sort">
                      Ordenar
                    </label>
                    <select
                      id="favorites-sort"
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
              </div>

              <DishCatalog dishes={favoriteDishes}>
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
                      <p className="text-lg font-semibold text-stone-800">Nada coincide con esos filtros</p>
                      <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
                        Prueba otro nombre o limpia los filtros para ver todos tus favoritos.
                      </p>
                      <button
                        type="button"
                        onClick={filters.clearFilters}
                        className="mt-5 rounded-2xl bg-red-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-900"
                      >
                        Ver todos los favoritos
                      </button>
                    </div>
                  )
                }
              </DishCatalog>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
