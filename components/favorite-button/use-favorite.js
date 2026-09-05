"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../auth-provider";
import { useAuthModal } from "../auth-modal/auth-modal-provider";
import { FAVORITES_CHANGED_EVENT, readFavorites, toggleFavoriteId } from "../../lib/favorites";
import { toast } from "../../lib/toast";

export function useFavorite(dish) {
  const { user, isLoaded } = useAuth();
  const { openAuth } = useAuthModal();
  const [isFavorite, setIsFavorite] = useState(false);
  const dishId = String(dish?.id || dish?._id || "");

  useEffect(() => {
    function syncFavorite() {
      if (user && dishId) {
        setIsFavorite(readFavorites(user.id).includes(dishId));
        return;
      }
      setIsFavorite(false);
    }

    syncFavorite();
    window.addEventListener(FAVORITES_CHANGED_EVENT, syncFavorite);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, syncFavorite);
  }, [dishId, user]);

  function toggleFavorite(event) {
    event?.stopPropagation();
    event?.preventDefault();

    if (!isLoaded || !dishId) {
      return;
    }

    if (!user) {
      toast.info("Primero inicia sesión para guardar favoritos");
      openAuth({ mode: "sign-in", reason: "favorites" });
      return;
    }

    try {
      const next = toggleFavoriteId(user.id, dishId);
      const added = next.includes(dishId);
      setIsFavorite(added);
      toast.success(added ? `${dish.name} se guardó en favoritos` : `${dish.name} se quitó de favoritos`);
    } catch {
      toast.error("No se pudo actualizar favoritos. Inténtalo de nuevo.");
    }
  }

  return { isFavorite, isLoaded, toggleFavorite };
}
