"use client";

import { useEffect, useRef, useState } from "react";
import StaffLink from "./staff-link";
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
  HiOutlineCog,
  HiOutlineChevronUp,
} from "react-icons/hi";
import Logo from "../../public/icons/logo.png";
import { signOutStaffAction } from "../../backend/actions/user";
import { userRoleLabel } from "../../backend/staff-format";
import { getStaffPageMeta } from "../../lib/staff-page-meta";

function mainNavItems(isAdmin) {
  const items = [
    { href: "/staff", label: "Resumen", icon: HiOutlineHome, exact: true },
    { href: "/staff/dishes", label: "Carta", icon: HiOutlineBookOpen },
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

function NavItem({ item, pathname, onClick }) {
  const Icon = item.icon;
  const active = isActivePath(pathname, item.href, item.exact);

  return (
    <StaffLink
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active ? "bg-red-700 text-white" : "text-stone-300 hover:bg-stone-800 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.label}</span>
    </StaffLink>
  );
}

export default function StaffShell({ user, children }) {
  const pathname = usePathname();
  const pageMeta = getStaffPageMeta(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const isAdmin = user.role === "admin";
  const items = mainNavItems(isAdmin);
  const settingsItem = {
    href: "/staff/settings",
    label: "Configuración",
    icon: HiOutlineCog,
  };

  function closeMenu() {
    setIsOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    function onPointerDown(event) {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function onKey(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
          {items.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} onClick={closeMenu} />
          ))}
        </nav>

        <div className="mt-auto border-t border-stone-800 px-3 py-3">
          <NavItem item={settingsItem} pathname={pathname} onClick={closeMenu} />

          <div className="relative mt-2" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-stone-800"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-800 text-xs font-semibold text-white">
                {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-stone-100">
                  {user.firstName} {user.lastName}
                </span>
                <span className="block truncate text-xs text-stone-400">{userRoleLabel(user.role)}</span>
              </span>
              <HiOutlineChevronUp
                className={`h-4 w-4 shrink-0 text-stone-400 transition ${profileOpen ? "" : "rotate-180"}`}
              />
            </button>

            {profileOpen ? (
              <div
                role="menu"
                className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-xl border border-stone-700 bg-stone-800 shadow-lg"
              >
                <form action={signOutStaffAction}>
                  <button
                    type="submit"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-stone-200 transition hover:bg-stone-700"
                  >
                    <HiOutlineLogout className="h-4 w-4" />
                    Salir
                  </button>
                </form>
              </div>
            ) : null}
          </div>
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
            <p className="truncate text-base font-semibold text-stone-900 sm:text-lg">{pageMeta.title}</p>
            <p className="truncate text-sm text-stone-500">{pageMeta.subtitle}</p>
          </div>
        </header>
        <div className="px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
