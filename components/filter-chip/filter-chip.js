"use client";

import { HiOutlineX } from "react-icons/hi";

export function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-red-800 px-3 py-1 text-xs font-medium text-white">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-white/20"
        aria-label={`Quitar filtro ${label}`}
      >
        <HiOutlineX className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export default function FilterChipList({ tags, onRemove, onClear }) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <FilterChip key={tag.id} label={tag.label} onRemove={() => onRemove(tag)} />
      ))}
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-red-800 underline-offset-2 hover:underline"
        >
          Limpiar
        </button>
      ) : null}
    </div>
  );
}
