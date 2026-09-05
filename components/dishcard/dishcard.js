"use client";

import AddToCartButton from "../addToCartButton/addtocartbutton";
import FavoriteButton from "../favorite-button/favorite-button";

// Dos en móvil, tres en tablet; en lg vuelve a dos porque entra el panel de filtros
export const DISH_CARD_GRID_CLASS =
  "grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3";

function GridDishCard({ dish, onOpen }) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-red-900/10 bg-white shadow-sm">
      <div className="relative">
        <button type="button" onClick={() => onOpen(dish)} className="block w-full text-left">
          <img
            src={dish.image}
            alt={dish.name}
            className="aspect-[4/3] w-full max-w-full object-cover"
          />
        </button>
        <div className="absolute right-2 top-2">
          <FavoriteButton dish={dish} variant="overlay" />
        </div>
        <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-red-800 px-2 py-0.5 text-[0.65rem] font-medium text-white sm:px-2.5 sm:text-xs">
          {dish.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:p-3.5">
        <h3 className="line-clamp-2 text-[clamp(0.82rem,2.6vw,1.05rem)] font-semibold leading-snug text-stone-900">
          <button type="button" onClick={() => onOpen(dish)} className="text-left hover:text-red-800">
            {dish.name}
          </button>
        </h3>
        <div className="mt-auto flex flex-col gap-2">
          <p className="text-[clamp(1.2rem,4vw,1.55rem)] font-semibold leading-none text-stone-900">
            {dish.price}
            <span className="text-[0.62em]">€</span>
          </p>
          <AddToCartButton dishId={dish._id} variant="card" />
        </div>
      </div>
    </article>
  );
}

function ListDishCard({ dish, onOpen }) {
  return (
    <article className="flex gap-3 rounded-2xl border border-red-900/10 bg-white p-3 sm:gap-4 sm:p-4">
      <button type="button" onClick={() => onOpen(dish)} className="relative shrink-0">
        <img
          src={dish.image}
          alt={dish.name}
          className="h-24 w-24 max-w-full rounded-xl object-cover sm:h-28 sm:w-32"
        />
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className="truncate rounded-full bg-red-800 px-2 py-0.5 text-[0.7rem] font-medium text-white">
              {dish.category}
            </span>
            <FavoriteButton dish={dish} variant="inline" />
          </div>
          <h3 className="mt-1.5 text-[clamp(0.95rem,2.5vw,1.15rem)] font-semibold leading-snug text-stone-900">
            <button type="button" onClick={() => onOpen(dish)} className="text-left hover:text-red-800">
              {dish.name}
            </button>
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[clamp(1.15rem,3.5vw,1.45rem)] font-semibold leading-none text-stone-900">
            {dish.price}
            <span className="text-[0.62em]">€</span>
          </p>
          <AddToCartButton dishId={dish._id} variant="list" />
        </div>
      </div>
    </article>
  );
}

export default function DishCard({ dish, onOpen, variant = "grid" }) {
  if (variant === "list") {
    return <ListDishCard dish={dish} onOpen={onOpen} />;
  }

  return <GridDishCard dish={dish} onOpen={onOpen} />;
}
