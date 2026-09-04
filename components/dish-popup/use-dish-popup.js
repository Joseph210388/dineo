"use client";

import { useCallback, useState } from "react";

export default function useDishPopup(dishes = []) {
  const [selectedDish, setSelectedDish] = useState(null);

  const openDish = useCallback(
    (dishOrId) => {
      if (dishOrId && typeof dishOrId === "object") {
        setSelectedDish(dishOrId);
        return;
      }

      const found = dishes.find((dish) => dish.id === dishOrId || dish._id === dishOrId);
      if (found) {
        setSelectedDish(found);
      }
    },
    [dishes]
  );

  const closeDish = useCallback(() => {
    setSelectedDish(null);
  }, []);

  return { selectedDish, openDish, closeDish };
}
