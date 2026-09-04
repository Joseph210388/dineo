"use client";

import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";

const MODES = [
  { id: "grid", label: "Cuadro", icon: HiOutlineViewGrid },
  { id: "list", label: "Lista", icon: HiOutlineViewList },
];

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1" role="group" aria-label="Vista de platos">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium sm:px-3 ${
              isActive ? "bg-red-800 text-white" : "text-stone-600 hover:bg-stone-50"
            }`}
            aria-pressed={isActive}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
