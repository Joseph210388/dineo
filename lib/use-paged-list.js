"use client";

import { useEffect, useState } from "react";

function itemsKey(items) {
  return items.map((item) => item.id ?? item._id ?? item.name ?? "").join("\n");
}

export function usePagedList(items, pageSize) {
  const [shown, setShown] = useState(pageSize);
  const key = itemsKey(items);

  // Al cambiar el filtro o el tamaño, volvemos al primer bloque visible.
  useEffect(() => {
    setShown(pageSize);
  }, [key, pageSize]);

  const visible = items.slice(0, shown);
  const remaining = Math.max(0, items.length - visible.length);

  return {
    visible,
    remaining,
    total: items.length,
    showMore() {
      setShown((current) => current + pageSize);
    },
  };
}
