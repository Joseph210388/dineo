"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HiOutlineHeart, HiOutlineLogout, HiOutlineClock, HiOutlineUser } from "react-icons/hi";
import { useAuth } from "../auth-provider";
import { useAuthModal } from "../auth-modal/auth-modal-provider";
import { signOutAction } from "../../backend/actions/user";

function userInitials(user) {
  return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
}

function MenuLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-700 hover:bg-cream"
    >
      {children}
    </Link>
  );
}

export default function UserMenu() {
  const { user, isLoaded } = useAuth();
  const { openAuth } = useAuthModal();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function onKey(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function handleLogout() {
    setIsOpen(false);
    await signOutAction();
    window.location.href = "/";
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-stone-300 transition hover:bg-stone-700 hover:text-white"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={user ? "Menú de usuario" : "Cuenta"}
      >
        {user?.photo ? (
          <img src={user.photo} alt="" className="h-full w-full object-cover" />
        ) : user ? (
          <span className="flex h-full w-full items-center justify-center bg-red-800 text-xs font-semibold text-white">
            {userInitials(user)}
          </span>
        ) : (
          <HiOutlineUser className="h-6 w-6" />
        )}
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(17rem,calc(100vw-1.5rem))] rounded-2xl border border-stone-200 bg-white p-2 shadow-lg"
        >
          {!isLoaded ? (
            <p className="px-3 py-2 text-sm text-stone-500">Cargando...</p>
          ) : user ? (
            <div>
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-cream px-3 py-3">
                {user.photo ? (
                  <img src={user.photo} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-800 text-sm font-semibold text-white">
                    {userInitials(user)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-stone-500">{user.email}</p>
                </div>
              </div>
              <MenuLink href="/favorites" onClick={() => setIsOpen(false)}>
                <HiOutlineHeart className="h-4 w-4 text-red-800" />
                Favoritos
              </MenuLink>
              <MenuLink href="/reservation" onClick={() => setIsOpen(false)}>
                <HiOutlineClock className="h-4 w-4 text-red-800" />
                Histórico
              </MenuLink>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-cream"
              >
                <HiOutlineLogout className="h-4 w-4 text-red-800" />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAuth({ mode: "sign-in" });
                }}
                className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-cream"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAuth({ mode: "sign-up" });
                }}
                className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-cream"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
