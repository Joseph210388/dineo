import { getAllDish } from "../../backend/actions/dish";
import FoodPage from "../../components/food-menu/food-page";

export const revalidate = 60;

export default async function Food() {
  const dishes = (await getAllDish()) || [];
  return <FoodPage dishes={dishes} />;
}
