"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBeaker,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import Logo from "../../public/icons/logo.png";
import { signOutStaffAction } from "../../backend/actions/user";
import { userRoleLabel } from "../../backend/staff-format";

function navItems(isAdmin) {
  const items = [
    { href: "/staff", label: "Resumen", icon: HiOutlineHome, exact: true },
    { href: "/staff/dishes", label: "Carta", icon: HiOutlineBookOpen },
    { href: "/staff/ingredients", label: "Ingredientes", icon: HiOutlineBeaker },
    { href: "/staff/allergens", label: "Alérgenos", icon: HiOutlineExclamationCircle },
    { href: "/staff/reservations", label: "Reservas", icon: HiOutlineCalendar },
  ];

  if (isAdmin) {
    items.push({ href: "/staff/users", label: "Usuarios", icon: HiOutlineUsers });
  }

  return items;
}

function isActivePath(pathname, href, exact) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function StaffShell({ user, children }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user.role === "admin";
  const items = navItems(isAdmin);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="min-h-svh bg-stone-100 text-stone-800">
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-stone-900/50 lg:hidden"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(18rem,88vw)] flex-col bg-stone-900 text-stone-100 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-stone-800 px-5 py-5">
          <Image src={Logo} alt="Taipei" className="h-10 w-10 rounded-lg object-contain" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-wide">Taipei</p>
            <p className="truncate text-xs text-stone-400">Panel DINEO</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href, item.exact);

            // Sin prefetch: si no, al entrar al panel se abren 5 rutas a Postgres a la vez y Vercel corta a los 10s
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={closeMenu}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-red-700 text-white"
                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-800 p-4">
          <p className="truncate text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-stone-400">{userRoleLabel(user.role)}</p>
          <form action={signOutStaffAction} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-800 px-3 py-2 text-sm text-stone-200 transition hover:bg-stone-700"
            >
              <HiOutlineLogout className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-[min(18rem,88vw)]">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 lg:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir menú"
          >
            {isOpen ? <HiOutlineX className="h-6 w-6" /> : <HiOutlineMenu className="h-6 w-6" />}
          </button>
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-red-700">
              Área interna
            </p>
            <p className="truncate text-sm text-stone-500 sm:text-base">Taipei · gestión del local</p>
          </div>
        </header>
        <div className="px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
