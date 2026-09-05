"use client";

import { useState } from "react";
import Logo from "../../public/icons/logo.png";
import Image from "next/image";
import Link from "next/link";
import CartButton from "../cart-button/cart-button";
import UserMenu from "../user-menu/user-menu";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/food", label: "Comida" },
  { href: "/about", label: "Nosotros" },
  { href: "/contact", label: "Contactanos" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-stone-800 border-b-2 border-b-red-700">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-stone-700 hover:text-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menú</span>
              <svg
                className={`h-6 w-6 ${isMobileMenuOpen ? "hidden" : "block"}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg
                className={`h-6 w-6 ${isMobileMenuOpen ? "block" : "hidden"}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <Image className="h-8 w-auto" src={Logo} alt="Taipei" />
            </Link>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-stone-300 hover:bg-stone-700 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <CartButton />
            <UserMenu />
          </div>
        </div>
      </div>

      <div className={`${isMobileMenuOpen ? "block" : "hidden"} sm:hidden`} id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-stone-700 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
