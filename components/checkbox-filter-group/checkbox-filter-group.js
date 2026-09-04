"use client";

import { useState } from "react";

const DEFAULT_VISIBLE = 5;

export default function CheckboxFilterGroup({
  title,
  options,
  selectedIds,
  onToggle,
  initialVisible = DEFAULT_VISIBLE,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Si hay 14 tipos, solo mostramos unos pocos para no alargar el panel
  const hiddenCount = Math.max(options.length - initialVisible, 0);
  const visibleOptions = isExpanded ? options : options.slice(0, initialVisible);

  return (
    <section>
      {title ? (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          {title}
        </h3>
      ) : null}
      <div className="space-y-1">
        {visibleOptions.map((option) => {
          const isChecked = selectedIds.includes(option.id);

          return (
            <label
              key={option.id}
              className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-sm text-stone-700 hover:bg-amber-50"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(option.id)}
                className="h-4 w-4 shrink-0 accent-red-800"
              />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.count != null ? (
                <span className="text-xs text-stone-400">{option.count}</span>
              ) : null}
            </label>
          );
        })}
      </div>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          className="mt-1 px-2 text-sm font-medium text-red-800 hover:underline"
        >
          {isExpanded ? "Ver menos" : `Ver más (${hiddenCount})`}
        </button>
      ) : null}
    </section>
  );
}
