"use client";

import { useEffect, useState } from "react";

function itemsKey(items) {
  return items.map((item) => item.id ?? item._id ?? item.name ?? "").join("\n");
}

/**
 * Paginación por páginas (solo se monta el trozo visible → menos DOM).
 */
export function usePaginator(items, pageSize) {
  const [page, setPage] = useState(1);
  const key = itemsKey(items);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  // Al filtrar o cambiar el tamaño, volvemos a la primera página
  useEffect(() => {
    setPage(1);
  }, [key, pageSize]);

  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);

  return {
    visible,
    total,
    page: safePage,
    totalPages,
    pageSize,
    setPage,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages && total > 0,
  };
}
