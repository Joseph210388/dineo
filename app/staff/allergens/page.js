import { listStaffCatalogs } from "../../../backend/actions/staff";
import CatalogManager from "../../../components/staff/catalog-manager";

export default async function StaffAllergensPage() {
  const catalogs = await listStaffCatalogs();

  return (
    <CatalogManager
      kind="allergen"
      title="Alérgenos"
      description="Crea aquí el catálogo. Luego, en cada plato, solo marcas los que aplican."
      items={catalogs.allergens}
    />
  );
}
