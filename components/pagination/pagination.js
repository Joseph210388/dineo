"use client";

import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  return [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)
    .reduce((list, page) => {
      const last = list[list.length - 1];
      if (typeof last === "number" && page - last > 1) {
        list.push("…");
      }
      list.push(page);
      return list;
    }, []);
}

export default function Pagination({ page, totalPages, total, pageSize, onPageChange, className = "" }) {
  if (total <= pageSize || totalPages <= 1) {
    return null;
  }

  const pages = buildPageList(page, totalPages);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      className={`mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`.trim()}
      aria-label="Paginación"
    >
      <p className="text-sm text-stone-500">
        {from}–{to} de {total}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:border-red-700 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
        >
          <HiOutlineChevronLeft className="h-5 w-5" />
        </button>

        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-stone-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium ${
                item === page
                  ? "bg-red-800 text-white"
                  : "border border-stone-200 bg-white text-stone-700 hover:border-red-700 hover:text-red-800"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:border-red-700 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página siguiente"
        >
          <HiOutlineChevronRight className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
