import { getAllDish } from "../../backend/actions/dish";
import FoodPage from "../../components/food-menu/food-page";

// La carta lee Postgres; el build de Vercel no alcanza el host IPv6 de Supabase
export const dynamic = "force-dynamic";

export default async function Food() {
  const dishes = (await getAllDish()) || [];
  return <FoodPage dishes={dishes} />;
}
