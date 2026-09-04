"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { addDishToCart } from "../../backend/actions/cart";
import { useAuth } from "../auth-provider";

export default function AddToCartButton({ dishId, variant = "card" }) {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  function goToSignIn() {
    const nextPage = pathname && pathname.startsWith("/") ? pathname : "/food";
    router.push(`/sign-in?redirect=${encodeURIComponent(nextPage)}&reason=cart`);
  }

  async function handleAddToCart() {
    if (!isLoaded) {
      return;
    }

    // Sin cuenta no hay carrito: primero entrar o registrarse
    if (!user) {
      goToSignIn();
      return;
    }

    setIsAdding(true);
    setMessage("");

    try {
      await addDishToCart(user.id, null, dishId);
      setMessage("Añadido al carrito");
    } catch {
      setMessage("No se pudo añadir. Inténtalo de nuevo.");
    } finally {
      setIsAdding(false);
    }
  }

  const label = !isLoaded ? "..." : isAdding ? "Añadiendo..." : variant === "list" ? "Añadir" : "Añadir al carrito";
  const buttonClass =
    variant === "popup"
      ? "w-full rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60 sm:w-auto"
      : variant === "list"
        ? "rounded-xl bg-red-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-900 disabled:opacity-60"
        : "block w-fit rounded-xl bg-red-800 px-4 py-2.5 text-sm font-medium text-white transition hover:scale-105 disabled:opacity-60";

  return (
    <div className={variant === "popup" ? "min-w-0 flex-1" : "shrink-0"}>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isLoaded || isAdding}
        className={buttonClass}
      >
        {label}
      </button>
      {message ? (
        <p className={`mt-2 text-xs ${variant === "popup" ? "text-stone-400" : "text-stone-600"}`}>{message}</p>
      ) : null}
    </div>
  );
}
