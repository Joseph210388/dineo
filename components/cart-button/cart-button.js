"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { getCartItemCount, getCartItems } from "../../backend/actions/cart";
import { CART_CHANGED_EVENT } from "../../lib/cart-events";
import { isStaffRole } from "../../lib/roles";
import { formatMoney } from "../../backend/staff-format";
import { useAuth } from "../auth-provider";
import { useAuthModal } from "../auth-modal/auth-modal-provider";
import CartFlyLayer from "./cart-fly-layer";

function CartIcon({ count, bump }) {
  const badge = count > 99 ? "99+" : String(count);

  return (
    <span
      data-cart-target
      className={`relative inline-flex h-10 w-10 items-center justify-center overflow-visible ${
        bump ? "animate-cart-pop" : ""
      }`}
    >
      <HiOutlineShoppingCart className="h-6 w-6" aria-hidden />
      {count > 0 ? (
        <span className="absolute right-0 top-0 z-10 flex h-5 min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold leading-none text-white shadow-sm">
          {badge}
        </span>
      ) : null}
    </span>
  );
}

export default function CartButton() {
  const { user, isLoaded } = useAuth();
  const { openAuth } = useAuthModal();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const closeTimer = useRef(null);
  const rootRef = useRef(null);

  async function refreshCart() {
    if (!user || isStaffRole(user.role)) {
      setCount(0);
      setItems([]);
      return;
    }

    try {
      const [nextCount, nextItems] = await Promise.all([getCartItemCount(), getCartItems()]);
      const value = typeof nextCount === "number" ? nextCount : Number(nextCount);
      setCount(Number.isFinite(value) ? value : 0);
      setItems(Array.isArray(nextItems) ? nextItems : []);
    } catch {
      setCount(0);
      setItems([]);
    }
  }

  useEffect(() => {
    if (!isLoaded) {
      return undefined;
    }

    refreshCart();

    function onCartChanged() {
      refreshCart();
      setBump(true);
      window.setTimeout(() => setBump(false), 420);
    }

    window.addEventListener(CART_CHANGED_EVENT, onCartChanged);
    window.addEventListener("focus", onCartChanged);

    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, onCartChanged);
      window.removeEventListener("focus", onCartChanged);
    };
  }, [user, isLoaded]);

  useEffect(() => {
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function scheduleClose() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  }

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  if (user && isStaffRole(user.role)) {
    return null;
  }

  const shellClass =
    "relative z-10 flex h-10 w-10 items-center justify-center overflow-visible rounded-full text-stone-300 transition hover:bg-stone-700 hover:text-white";

  if (!user) {
    return (
      <>
        <CartFlyLayer />
        <button
          type="button"
          onClick={() => openAuth({ mode: "sign-in", reason: "cart", redirectPath: "/cart" })}
          className={shellClass}
          aria-label="Carrito"
        >
          <CartIcon count={0} />
        </button>
      </>
    );
  }

  const preview = items.slice(0, 4);
  const extra = Math.max(0, items.length - preview.length);

  return (
    <div
      ref={rootRef}
      className="relative z-30"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
        refreshCart();
      }}
      onMouseLeave={scheduleClose}
    >
      <CartFlyLayer />
      <Link
        href="/cart"
        className={shellClass}
        aria-label={count > 0 ? `Carrito, ${count} platillos` : "Carrito"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(false)}
      >
        <CartIcon count={count} bump={bump} />
      </Link>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.4rem)] w-[min(19rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-stone-200 bg-white text-stone-800 shadow-xl shadow-stone-900/15"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="border-b border-stone-100 px-3 py-2.5">
            <p className="text-sm font-semibold text-stone-900">Tu carrito</p>
            <p className="text-xs text-stone-500">
              {count === 0 ? "Aún vacío" : `${count} ${count === 1 ? "platillo" : "platillos"}`}
            </p>
          </div>

          {preview.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-stone-500">
              Añade algo desde la carta.
            </p>
          ) : (
            <ul className="max-h-56 divide-y divide-stone-100 overflow-y-auto">
              {preview.map((item) => (
                <li key={item.dishId} className="flex items-center gap-2.5 px-3 py-2.5">
                  <img
                    src={item.dishImage}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900">{item.dishName}</p>
                    <p className="text-xs text-stone-500">
                      ×{item.quantity} · {formatMoney(item.dishPrice * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {extra > 0 ? (
            <p className="px-3 pb-1 text-xs text-stone-500">y {extra} más…</p>
          ) : null}

          <div className="border-t border-stone-100 p-2.5">
            <Link
              href="/cart"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-red-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-900"
            >
              Completar reservación
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
