"use client";

import { useMemo, useState } from "react";
import {
  filterAndSortDishes,
  getActiveFilterTags,
  getDishCategories,
  toggleSelection,
} from "./filter-dishes";

export function useDishFilters(dishes) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [order, setOrder] = useState("menu");
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const categoryOptions = useMemo(() => getDishCategories(dishes), [dishes]);
  const visibleDishes = useMemo(
    () => filterAndSortDishes(dishes, { query, categories, types, order }),
    [dishes, query, categories, types, order]
  );
  const tags = useMemo(
    () => getActiveFilterTags({ query, categories, types, order }),
    [query, categories, types, order]
  );

  function clearFilters() {
    setQuery("");
    setCategories([]);
    setTypes([]);
    setOrder("menu");
  }

  function removeTag(tag) {
    if (tag.group === "query") {
      setQuery("");
      return;
    }

    if (tag.group === "category") {
      setCategories((current) => current.filter((item) => item !== tag.value));
      return;
    }

    if (tag.group === "type") {
      setTypes((current) => current.filter((item) => item !== tag.value));
      return;
    }

    if (tag.group === "order") {
      setOrder("menu");
    }
  }

  return {
    query,
    setQuery,
    categories,
    types,
    order,
    setOrder,
    areFiltersOpen,
    setAreFiltersOpen,
    categoryOptions,
    visibleDishes,
    tags,
    clearFilters,
    removeTag,
    onToggleCategory(id) {
      setCategories((current) => toggleSelection(current, id));
    },
    onToggleType(id) {
      setTypes((current) => toggleSelection(current, id));
    },
  };
}
