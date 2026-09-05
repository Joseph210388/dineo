"use client";

import Link from "next/link";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { useAuth } from "../auth-provider";
import { useAuthModal } from "../auth-modal/auth-modal-provider";

export default function CartButton() {
  const { user } = useAuth();
  const { openAuth } = useAuthModal();

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openAuth({ mode: "sign-in", reason: "cart", redirectPath: "/cart" })}
        className="flex h-10 w-10 items-center justify-center rounded-full text-stone-300 transition hover:bg-stone-700 hover:text-white"
        aria-label="Carrito"
      >
        <HiOutlineShoppingCart className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Link
      href="/cart"
      className="flex h-10 w-10 items-center justify-center rounded-full text-stone-300 transition hover:bg-stone-700 hover:text-white"
      aria-label="Carrito"
    >
      <HiOutlineShoppingCart className="h-6 w-6" />
    </Link>
  );
}
