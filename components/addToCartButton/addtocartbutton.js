"use client";

import { useState } from "react";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { addDishToCart } from "../../backend/actions/cart";
import { notifyCartChanged, notifyCartFly } from "../../lib/cart-events";
import { useAuth } from "../auth-provider";
import { useAuthModal } from "../auth-modal/auth-modal-provider";
import { isStaffRole } from "../../lib/roles";

export default function AddToCartButton({ dishId, imageUrl = "", variant = "card" }) {
  const { user, isLoaded } = useAuth();
  const { openAuth } = useAuthModal();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddToCart(event) {
    event.stopPropagation();
    if (!isLoaded) {
      return;
    }

    // Sin cuenta no hay carrito: primero entrar o registrarse
    if (!user) {
      openAuth({ mode: "sign-in", reason: "cart" });
      return;
    }

    if (isStaffRole(user.role)) {
      setMessage("El personal reserva en el panel, no desde la carta.");
      return;
    }

    setIsAdding(true);
    setMessage("");

    const from = event.currentTarget.getBoundingClientRect();

    try {
      await addDishToCart(user.id, null, dishId);
      if (imageUrl) {
        notifyCartFly({
          imageUrl,
          from: { x: from.left, y: from.top, w: from.width, h: from.height },
        });
      }
      notifyCartChanged();
      setMessage("Añadido al carrito");
    } catch {
      setMessage("No se pudo añadir. Inténtalo de nuevo.");
    } finally {
      setIsAdding(false);
    }
  }

  const isCompact = variant === "card" || variant === "list" || variant === "mini";
  const label = !isLoaded
    ? "..."
    : isAdding
    ? "..."
    : variant === "mini"
      ? "Añadir"
      : variant === "list" || variant === "card"
        ? "Añadir"
        : "Añadir al carrito";
  const buttonClass =
    variant === "popup"
      ? "w-full rounded-2xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60 sm:w-auto"
      : variant === "mini"
        ? "inline-flex w-full items-center justify-center gap-1 rounded-lg bg-red-800 px-1.5 py-1.5 text-[0.65rem] font-medium text-white transition hover:bg-red-900 disabled:opacity-60"
      : variant === "list"
        ? "inline-flex items-center gap-1.5 rounded-xl bg-red-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-900 disabled:opacity-60"
        : "inline-flex w-full items-center justify-center gap-1 rounded-xl bg-red-800 px-2 py-1.5 text-[0.7rem] font-medium text-white transition hover:bg-red-900 disabled:opacity-60 sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-xs";

  return (
    <div className={variant === "popup" ? "min-w-0 flex-1" : variant === "list" ? "shrink-0" : "w-full"}>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isLoaded || isAdding}
        className={buttonClass}
      >
        {isCompact && isLoaded && !isAdding ? (
          <HiOutlineShoppingCart
            className={
              variant === "mini"
                ? "h-3 w-3 shrink-0"
                : "h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
            }
            aria-hidden="true"
          />
        ) : null}
        {label}
      </button>
      {message && variant !== "mini" ? (
        <p className={`mt-2 text-xs ${variant === "popup" ? "text-stone-400" : "text-stone-600"}`}>{message}</p>
      ) : null}
    </div>
  );
}
