import { listStaffCategories } from "../../../backend/actions/staff";
import CatalogManager from "../../../components/staff/catalog-manager";

export default async function StaffCategoriesPage() {
  const items = await listStaffCategories();

  return (
    <CatalogManager
      kind="category"
      title="Categorías"
      description="Entradas, principales, postres… Con ellas la carta agrupa platos y sugiere otros al comensal."
      items={items}
    />
  );
}
