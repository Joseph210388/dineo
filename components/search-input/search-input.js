"use client";

import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  label = "Buscar",
}) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">{label}</span>
      <HiOutlineSearch className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-11 pr-10 text-sm text-stone-800 outline-none ring-red-700/15 focus:border-red-700 focus:ring-4 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          aria-label="Limpiar búsqueda"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      ) : null}
    </label>
  );
}
