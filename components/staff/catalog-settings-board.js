"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineBeaker,
  HiOutlineExclamationCircle,
  HiOutlineTag,
} from "react-icons/hi";
import Popup from "../popup/popup";
import CatalogManager from "./catalog-manager";

const CATALOG_QUERY = {
  categories: "category",
  ingredients: "ingredient",
  allergens: "allergen",
  category: "category",
  ingredient: "ingredient",
  allergen: "allergen",
};

const CATALOGS = [
  {
    kind: "category",
    query: "categories",
    title: "Categorías",
    description: "Entradas, principales, postres… Agrupan la carta y las sugerencias.",
    icon: HiOutlineTag,
  },
  {
    kind: "ingredient",
    query: "ingredients",
    title: "Ingredientes",
    description: "Catálogo para marcar en cada plato lo que lleva.",
    icon: HiOutlineBeaker,
  },
  {
    kind: "allergen",
    query: "allergens",
    title: "Alérgenos",
    description: "Catálogo para marcar en cada plato lo que aplica.",
    icon: HiOutlineExclamationCircle,
  },
];

function kindFromQuery(value) {
  if (!value) {
    return null;
  }
  return CATALOG_QUERY[String(value).toLowerCase()] || null;
}

export default function CatalogSettingsBoard({ categories, ingredients, allergens }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openKind, setOpenKind] = useState(() => kindFromQuery(searchParams.get("catalog")));

  const itemsByKind = useMemo(
    () => ({
      category: categories,
      ingredient: ingredients,
      allergen: allergens,
    }),
    [categories, ingredients, allergens]
  );

  useEffect(() => {
    setOpenKind(kindFromQuery(searchParams.get("catalog")));
  }, [searchParams]);

  function setCatalogQuery(kind) {
    const entry = CATALOGS.find((item) => item.kind === kind);
    const params = new URLSearchParams(searchParams.toString());
    if (entry) {
      params.set("catalog", entry.query);
    } else {
      params.delete("catalog");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function openCatalog(kind) {
    setOpenKind(kind);
    setCatalogQuery(kind);
  }

  function closeCatalog() {
    setOpenKind(null);
    setCatalogQuery(null);
  }

  const openMeta = CATALOGS.find((item) => item.kind === openKind);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Configuración</h1>
      <p className="mt-1 max-w-2xl text-sm text-stone-500">
        Categorías, ingredientes y alérgenos en un solo sitio. Ábrelos en un popup para
        gestionarlos sin una página entera cada uno.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOGS.map((catalog) => {
          const Icon = catalog.icon;
          const count = itemsByKind[catalog.kind]?.length || 0;

          return (
            <button
              key={catalog.kind}
              type="button"
              onClick={() => openCatalog(catalog.kind)}
              className="flex flex-col items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-red-700/40 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-red-700/15"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-800">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-base font-semibold text-stone-900">{catalog.title}</span>
                <span className="mt-1 block text-sm text-stone-500">{catalog.description}</span>
              </span>
              <span className="mt-auto flex w-full items-center justify-between gap-2 pt-1">
                <span className="text-xs font-medium text-stone-500">
                  {count} {count === 1 ? "ítem" : "ítems"}
                </span>
                <span className="text-sm font-medium text-red-800">Gestionar</span>
              </span>
            </button>
          );
        })}
      </div>

      <Popup
        isOpen={Boolean(openMeta)}
        onClose={closeCatalog}
        title={openMeta?.title || ""}
        headerTone="brand"
        maxWidthClass="max-w-lg"
        panelBgClass="bg-cream"
        overflowMode="none"
        panelClassName="min-h-0 max-h-[min(88svh,36rem)]"
      >
        {openMeta ? (
          <CatalogManager
            key={openMeta.kind}
            kind={openMeta.kind}
            title={openMeta.title}
            description={openMeta.description}
            items={itemsByKind[openMeta.kind] || []}
            variant="panel"
          />
        ) : null}
      </Popup>
    </div>
  );
}
