"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineChevronDown, HiOutlineX } from "react-icons/hi";
import StaffLink from "./staff-link";

function OptionCheck({ active }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
        active ? "border-red-800 bg-red-800 text-white" : "border-stone-300 bg-white"
      }`}
      aria-hidden="true"
    >
      {active ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

export default function MultiSelectField({
  name,
  label,
  options = [],
  selectedIds = [],
  catalogHref,
  emptyText,
  placeholder = "Escribe para buscar…",
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => selectedIds.map(String));
  const [menuBox, setMenuBox] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelected(selectedIds.map(String));
  }, [selectedIds]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedOptions = options.filter((option) => selectedSet.has(String(option.id)));
  const filtered = options.filter((option) =>
    option.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function updateMenuBox() {
    const node = rootRef.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 220 && rect.top > spaceBelow;
    setMenuBox({
      left: rect.left,
      width: rect.width,
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      maxHeight: Math.min(220, openUp ? rect.top - 16 : spaceBelow - 16),
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    updateMenuBox();
    function onReposition() {
      updateMenuBox();
    }
    window.addEventListener("resize", onReposition);
    // Al hacer scroll en el popup, reposicionamos o cerramos para no romper el layout
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function onPointerDown(event) {
      const inRoot = rootRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inRoot && !inMenu) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function toggle(id) {
    const value = String(id);
    setSelected((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  function remove(id) {
    setSelected((current) => current.filter((item) => item !== String(id)));
  }

  const menu =
    mounted && open && menuBox
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-multiselectable="true"
            id={`${listId}-list`}
            style={{
              position: "fixed",
              left: menuBox.left,
              width: menuBox.width,
              top: menuBox.top,
              bottom: menuBox.bottom,
              maxHeight: menuBox.maxHeight,
              zIndex: 90,
            }}
            className="flex flex-col overflow-hidden rounded-xl border border-stone-300 bg-cream shadow-lg shadow-stone-900/15"
          >
            <ul className="thin-scrollbar min-h-0 flex-1 overflow-y-auto py-1">
              {filtered.length ? (
                filtered.map((option) => {
                  const active = selectedSet.has(String(option.id));
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => toggle(option.id)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-stone-100 ${
                          active ? "bg-red-50 text-red-900" : "text-stone-700"
                        }`}
                      >
                        <OptionCheck active={active} />
                        <span className="truncate">{option.name}</span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-4 text-center text-sm text-stone-500">Sin coincidencias</li>
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <label className="block text-sm font-medium text-stone-700" htmlFor={listId}>
        {label}
      </label>
      {catalogHref ? (
        <p className="mt-1 text-xs text-stone-500">
          Si falta uno, créalo en{" "}
          <StaffLink href={catalogHref} className="font-medium text-red-800 hover:underline">
            su tabla
          </StaffLink>
          .
        </p>
      ) : null}

      {!options.length ? (
        <p className="mt-2 rounded-xl border border-dashed border-stone-300 bg-cream px-3 py-4 text-sm text-stone-500">
          {emptyText}
        </p>
      ) : (
        <>
          {selectedOptions.length ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {selectedOptions.map((option) => (
                <span
                  key={option.id}
                  className="inline-flex max-w-full items-center gap-1 rounded-lg bg-stone-200/80 px-2 py-0.5 text-xs font-medium text-stone-800"
                >
                  <span className="truncate">{option.name}</span>
                  <button
                    type="button"
                    aria-label={`Quitar ${option.name}`}
                    className="rounded p-0.5 hover:bg-stone-300"
                    onClick={() => remove(option.id)}
                  >
                    <HiOutlineX className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <div className="relative mt-1.5">
            <input
              ref={inputRef}
              id={listId}
              type="text"
              value={query}
              placeholder={placeholder}
              autoComplete="off"
              aria-expanded={open}
              aria-controls={`${listId}-list`}
              aria-autocomplete="list"
              role="combobox"
              onFocus={() => {
                setOpen(true);
                updateMenuBox();
              }}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                  inputRef.current?.blur();
                }
              }}
              className="w-full rounded-xl border border-stone-300/80 bg-cream py-2.5 pl-3.5 pr-10 text-sm text-stone-800 outline-none ring-red-700/15 transition placeholder:text-stone-400 focus:border-red-700 focus:bg-white focus:ring-4"
            />
            <HiOutlineChevronDown
              className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500 transition ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
          {menu}
        </>
      )}
    </div>
  );
}
