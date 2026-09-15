import { Suspense } from "react";
import {
  listStaffAllergens,
  listStaffCategories,
  listStaffIngredients,
} from "../../../backend/actions/staff";
import CatalogSettingsBoard from "../../../components/staff/catalog-settings-board";

export default async function StaffSettingsPage() {
  const [categories, ingredients, allergens] = await Promise.all([
    listStaffCategories(),
    listStaffIngredients(),
    listStaffAllergens(),
  ]);

  return (
    <Suspense fallback={<p className="text-sm text-stone-500">Cargando configuración…</p>}>
      <CatalogSettingsBoard
        categories={categories}
        ingredients={ingredients}
        allergens={allergens}
      />
    </Suspense>
  );
}
