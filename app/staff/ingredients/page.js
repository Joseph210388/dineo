import { listStaffIngredients } from "../../../backend/actions/staff";
import CatalogManager from "../../../components/staff/catalog-manager";

export default async function StaffIngredientsPage() {
  const items = await listStaffIngredients();

  return (
    <CatalogManager
      kind="ingredient"
      title="Ingredientes"
      description="Crea aquí el catálogo. Luego, en cada plato, solo marcas los que lleva."
      items={items}
    />
  );
}
