"use client";

import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import { useFavorite } from "./use-favorite";

const VARIANTS = {
  overlay:
    "flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-sm hover:bg-white sm:h-10 sm:w-10",
  panel:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50",
  inline:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 hover:border-red-700",
};

export default function FavoriteButton({ dish, variant = "overlay" }) {
  const { isFavorite, isLoaded, toggleFavorite } = useFavorite(dish);
  const iconClass = variant === "inline" ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6";

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={!isLoaded}
      className={VARIANTS[variant] || VARIANTS.overlay}
      aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {isFavorite ? (
        <HiHeart className={`${iconClass} text-red-600`} />
      ) : (
        <HiOutlineHeart className={iconClass} />
      )}
    </button>
  );
}
