import { listStaffCatalogs, listStaffDishes } from "../../../backend/actions/staff";
import DishBoard from "../../../components/staff/dish-board";

export default async function StaffDishesPage() {
  const [dishes, catalogs] = await Promise.all([listStaffDishes(), listStaffCatalogs()]);

  return <DishBoard dishes={dishes} catalogs={catalogs} />;
}
