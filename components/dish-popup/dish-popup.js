"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HiHeart, HiOutlineHeart, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../auth-provider";
import AddToCartButton from "../addToCartButton/addtocartbutton";

function favoritesKey(userId) {
  return `taipei_favorites_${userId}`;
}

function readFavorites(userId) {
  try {
    return JSON.parse(localStorage.getItem(favoritesKey(userId)) || "[]");
  } catch {
    return [];
  }
}

export default function DishPopup({ dish, onClose, onOpenDish }) {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const photos = dish.images?.length ? dish.images : [dish.image];
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setPhotoIndex(0);
    if (user) {
      setIsFavorite(readFavorites(user.id).includes(String(dish.id)));
    } else {
      setIsFavorite(false);
    }

    function onKey(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [dish.id, onClose, user]);

  function toggleFavorite() {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      const nextPage = pathname && pathname.startsWith("/") ? pathname : "/food";
      router.push(`/sign-in?redirect=${encodeURIComponent(nextPage)}&reason=cart`);
      return;
    }

    const current = readFavorites(user.id);
    const dishId = String(dish.id);
    const next = current.includes(dishId)
      ? current.filter((id) => id !== dishId)
      : [...current, dishId];

    localStorage.setItem(favoritesKey(user.id), JSON.stringify(next));
    setIsFavorite(next.includes(dishId));
  }

  const currentPhoto = photos[photoIndex] || dish.image;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Cerrar" onClick={onClose} />

      <article className="relative z-10 flex max-h-[94svh] w-full max-w-xl flex-col overflow-y-auto rounded-t-3xl bg-white text-stone-900 sm:max-w-2xl sm:rounded-3xl">
        <div className="relative">
          <img
            src={currentPhoto}
            alt={dish.name}
            className="h-[36vh] min-h-52 w-full object-cover sm:h-72"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm sm:right-4 sm:top-4"
            aria-label="Cerrar"
          >
            <HiOutlineX className="h-6 w-6" />
          </button>

          {photos.length > 1 ? (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setPhotoIndex(index)}
                  className={`h-2 w-2 rounded-full ${index === photoIndex ? "bg-red-700" : "bg-stone-400"}`}
                  aria-label={`Foto ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-5 px-5 pb-6 pt-2 sm:px-7 sm:pb-7">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-700">{dish.category}</p>

          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-[clamp(1.5rem,5vw,2.1rem)] leading-tight">{dish.name}</h2>
            <button
              type="button"
              onClick={toggleFavorite}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50"
              aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              {isFavorite ? (
                <HiHeart className="h-6 w-6 text-red-600" />
              ) : (
                <HiOutlineHeart className="h-6 w-6 text-stone-700" />
              )}
            </button>
          </div>

          <p className="text-sm leading-relaxed text-stone-600 sm:text-base">{dish.description}</p>

          <div>
            <h3 className="text-sm font-semibold text-stone-900">Alérgenos</h3>
            {dish.allergens?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {dish.allergens.map((allergen) => (
                  <span key={allergen} className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-800">
                    {allergen}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-stone-500">Aún no hay alérgenos indicados para este plato.</p>
            )}
          </div>

          {dish.ingredients?.length ? (
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-800">Ingredientes: </span>
              {dish.ingredients.join(", ")}
            </p>
          ) : null}

          {dish.recommendation ? (
            <p className="text-sm text-stone-600">
              <span className="font-semibold text-stone-800">Recomendación: </span>
              {dish.recommendation}
            </p>
          ) : null}

          {dish.suggestions?.length ? (
            <div>
              <h3 className="text-sm font-semibold text-stone-900">También te puede gustar</h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {dish.suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => onOpenDish(suggestion.id)}
                    className="flex items-center gap-3 rounded-2xl border border-stone-200 p-2 text-left hover:border-red-700 sm:flex-col sm:items-stretch"
                  >
                    <img
                      src={suggestion.image}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover sm:h-20 sm:w-full"
                    />
                    <span className="text-sm text-stone-800">{suggestion.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-stone-500">Total del plato:</p>
              <p className="text-[clamp(1.5rem,4vw,2rem)] text-stone-900">{dish.price}€</p>
            </div>
            <AddToCartButton dishId={dish._id} variant="popup" />
          </div>
        </div>
      </article>
    </div>
  );
}
