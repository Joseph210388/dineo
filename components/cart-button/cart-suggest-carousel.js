"use client";

import { useEffect, useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { formatMoney } from "../../backend/staff-format";
import AddToCartButton from "../addToCartButton/addtocartbutton";

export default function CartSuggestCarousel({ dishes, onOpenDish }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) {
      return undefined;
    }
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [dishes]);

  function scrollByCard(direction) {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    const card = el.querySelector("[data-suggest-card]");
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.75;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  if (!dishes?.length) {
    return null;
  }

  return (
    <section className="mt-8 w-full border-t border-red-700/40 pt-6 md:mt-10 md:pt-8" aria-label="Sugerencias de la carta">
      <div className="mb-4 flex items-center justify-between gap-3 px-1 sm:px-0">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl md:text-2xl">
            También te puede gustar
          </h2>
          <p className="mt-0.5 text-sm text-stone-500">Más platos de la carta para tu reserva</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label="Anterior"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-50 disabled:cursor-default disabled:opacity-35 sm:h-10 sm:w-10"
          >
            <HiChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-50 disabled:cursor-default disabled:opacity-35 sm:h-10 sm:w-10"
          >
            <HiChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {dishes.map((dish) => (
          <article
            key={dish.id}
            data-suggest-card
            className="w-[min(42vw,9.5rem)] shrink-0 snap-start sm:w-40 md:w-44 lg:w-48"
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => onOpenDish?.({ dishId: dish.id })}
            >
              <img
                src={dish.image}
                alt=""
                className="mb-2 h-24 w-full rounded-xl object-cover sm:h-28 md:h-32"
              />
              <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-stone-900 underline-offset-2 hover:underline">
                {dish.name}
              </p>
            </button>
            <p className="mb-2 text-sm font-semibold text-stone-800">{formatMoney(dish.price)}</p>
            <AddToCartButton dishId={dish.id} imageUrl={dish.image} variant="card" />
          </article>
        ))}
      </div>
    </section>
  );
}
