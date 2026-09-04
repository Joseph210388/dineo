"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../components/auth-provider";
import Slider from "../../components/slider/slider";
import { getAllDish } from "../../backend/actions/dish";
import DishCard from "../../components/dishcard/dishcard";
import DishCatalog from "../../components/dish-popup/dish-catalog";
import FoodFilters from "../../components/food-menu/food-filters";
import FilterChipList from "../../components/filter-chip/filter-chip";
import ViewToggle from "../../components/view-toggle/view-toggle";
import {
  PRICE_ORDERS,
  filterAndSortDishes,
  getActiveFilterTags,
  getDishCategories,
  toggleSelection,
} from "../../lib/filter-dishes";

const VIEW_STORAGE_KEY = "taipei_food_view";

export default function Food() {
  const { user } = useAuth();
  const [fechaActual] = useState(() => new Date());
  const [dishes, setDishes] = useState([]);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [order, setOrder] = useState("menu");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    async function loadDishes() {
      const dishesList = await getAllDish();
      if (dishesList) {
        setDishes(dishesList);
      }
    }

    loadDishes();

    const savedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }
  }, []);

  const categoryOptions = useMemo(() => getDishCategories(dishes), [dishes]);
  const visibleDishes = useMemo(
    () => filterAndSortDishes(dishes, { query, categories, types, order }),
    [dishes, query, categories, types, order]
  );
  const tags = useMemo(
    () => getActiveFilterTags({ query, categories, types, order }),
    [query, categories, types, order]
  );

  function clearFilters() {
    setQuery("");
    setCategories([]);
    setTypes([]);
    setOrder("menu");
  }

  function removeTag(tag) {
    if (tag.group === "query") {
      setQuery("");
      return;
    }

    if (tag.group === "category") {
      setCategories((current) => current.filter((item) => item !== tag.value));
      return;
    }

    if (tag.group === "type") {
      setTypes((current) => current.filter((item) => item !== tag.value));
      return;
    }

    if (tag.group === "order") {
      setOrder("menu");
    }
  }

  function changeView(nextView) {
    setViewMode(nextView);
    window.localStorage.setItem(VIEW_STORAGE_KEY, nextView);
  }

  return (
    <section className="flex-1 bg-[#f3eee6]">
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
              {user ? (
                <span className="text-red-800">
                  {" "}
                  {user.firstName} {user.lastName}
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
            categoryOptions={categoryOptions}
            query={query}
            categories={categories}
            types={types}
            areOpen={areFiltersOpen}
            onToggle={() => setAreFiltersOpen((open) => !open)}
            onQueryChange={setQuery}
            onToggleCategory={(id) => setCategories((current) => toggleSelection(current, id))}
            onToggleType={(id) => setTypes((current) => toggleSelection(current, id))}
            onRemoveTag={removeTag}
            onClear={clearFilters}
            tags={tags}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-col gap-3 sm:mb-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[clamp(1.2rem,3vw,1.5rem)] font-semibold text-stone-900">
                    Platillos disponibles
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {visibleDishes.length} de {dishes.length} en la mesa
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor="food-sort">
                    Ordenar
                  </label>
                  <select
                    id="food-sort"
                    value={order}
                    onChange={(event) => setOrder(event.target.value)}
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
                <FilterChipList tags={tags} onRemove={removeTag} onClear={tags.length ? clearFilters : undefined} />
              </div>

              {!user ? (
                <p className="text-sm text-stone-500">
                  Mira la carta sin cuenta. Para pedir, entra o regístrate.
                </p>
              ) : null}
            </div>

            <DishCatalog dishes={dishes}>
              {(openDish) =>
                visibleDishes.length ? (
                  <div
                    className={
                      viewMode === "list"
                        ? "grid grid-cols-1 gap-3"
                        : "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    }
                  >
                    {visibleDishes.map((dish) => (
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
                      onClick={clearFilters}
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
