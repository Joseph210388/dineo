import { listStaffDishes, listStaffCatalogs } from "../../../backend/actions/staff";
import DishBoard from "../../../components/staff/dish-board";

export default async function StaffDishesPage() {
  const dishes = await listStaffDishes();
  const catalogs = await listStaffCatalogs();

  return <DishBoard dishes={dishes} catalogs={catalogs} />;
}
