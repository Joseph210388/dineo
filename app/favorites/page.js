import { getAllDish } from "../../backend/actions/dish";
import FavoritesPage from "../../components/favorites/favorites-page";

// Favoritos pide sesión y Postgres; no se puede generar en el build de Vercel (IPv6)
export const dynamic = "force-dynamic";

export default async function Favorites() {
  const dishes = (await getAllDish()) || [];
  return <FavoritesPage dishes={dishes} />;
}
