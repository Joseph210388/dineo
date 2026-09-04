"use client";

import DishPopup from "./dish-popup";
import useDishPopup from "./use-dish-popup";

export default function DishCatalog({ dishes, children }) {
  const { selectedDish, openDish, closeDish } = useDishPopup(dishes);

  return (
    <div className="contents">
      {children(openDish)}
      {selectedDish ? (
        <DishPopup dish={selectedDish} onClose={closeDish} onOpenDish={openDish} />
      ) : null}
    </div>
  );
}
