"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/auth-provider";
import { getAllDish } from "../../backend/actions/dish";
import DishCard from "../../components/dishcard/dishcard";
import DishCatalog from "../../components/dish-popup/dish-catalog";
import { readFavorites } from "../../lib/favorites";

export default function FavoritesPage() {
  const { user, isLoaded } = useAuth();
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!isLoaded || !user) {
        return;
      }

      const dishes = (await getAllDish()) || [];
      const ids = new Set(readFavorites(user.id).map(String));
      setFavoriteDishes(dishes.filter((dish) => ids.has(String(dish.id)) || ids.has(String(dish._id))));
      setIsLoading(false);
    }

    loadFavorites();
  }, [isLoaded, user]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-5 md:px-6 md:py-10 lg:px-8">
      <header className="mb-6 text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-red-800">Tu mesa</p>
        <h1 className="mt-2 text-[clamp(1.5rem,4vw,2.1rem)] font-semibold text-stone-900">Favoritos</h1>
        <p className="mt-2 text-sm text-stone-500">Los platos que has marcado para volver a ellos.</p>
      </header>

      {isLoading ? (
        <p className="text-center text-sm text-stone-500">Cargando tus favoritos...</p>
      ) : favoriteDishes.length ? (
        <DishCatalog dishes={favoriteDishes}>
          {(openDish) => (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteDishes.map((dish) => (
                <DishCard key={dish._id} dish={dish} onOpen={openDish} />
              ))}
            </div>
          )}
        </DishCatalog>
      ) : (
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
      )}
    </section>
  );
}
