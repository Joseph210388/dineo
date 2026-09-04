"use client";

import AddToCartButton from "../addToCartButton/addtocartbutton";

function GridDishCard({ dish, onOpen }) {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-white">
      <button type="button" onClick={() => onOpen(dish)} className="block w-full text-left">
        <img
          src={dish.image}
          alt={dish.name}
          className="h-48 w-full rounded-t-xl object-cover transition duration-500 group-hover:scale-105 sm:h-56 md:h-64"
        />
      </button>

      <div className="relative rounded-b-xl border border-t-0 border-gray-100 p-4 sm:p-5">
        <span className="whitespace-nowrap rounded-xl bg-red-800 px-3 py-1.5 text-xs font-medium text-white">
          {dish.category}
        </span>
        <h3 className="mt-3 text-lg font-medium text-gray-900">
          <button type="button" onClick={() => onOpen(dish)} className="hover:text-red-700 hover:underline">
            {dish.name}
          </button>
        </h3>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-700">{dish.price}€</p>
          <AddToCartButton dishId={dish._id} variant="card" />
        </div>
      </div>
    </article>
  );
}

function ListDishCard({ dish, onOpen }) {
  return (
    <article className="flex gap-3 rounded-xl bg-white p-3 sm:gap-4 sm:p-4">
      <button type="button" onClick={() => onOpen(dish)} className="shrink-0">
        <img
          src={dish.image}
          alt={dish.name}
          className="h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-32"
        />
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <span className="whitespace-nowrap rounded-lg bg-red-800 px-2 py-1 text-[0.7rem] font-medium text-white">
            {dish.category}
          </span>
          <h3 className="mt-1.5 text-base font-medium text-gray-900 sm:text-lg">
            <button type="button" onClick={() => onOpen(dish)} className="hover:text-red-700 hover:underline">
              {dish.name}
            </button>
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-700">{dish.price}€</p>
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
