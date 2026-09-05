import { getAllDish } from "../../backend/actions/dish";
import FavoritesPage from "../../components/favorites/favorites-page";

export const revalidate = 60;

export default async function Favorites() {
  const dishes = (await getAllDish()) || [];
  return <FavoritesPage dishes={dishes} />;
}
