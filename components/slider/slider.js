"use client";

import { useState } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";

const SLIDES = [
  "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/3186654/pexels-photo-3186654.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "https://images.pexels.com/photos/750073/pexels-photo-750073.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
];

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  function go(delta) {
    setCurrentIndex((index) => (index + delta + SLIDES.length) % SLIDES.length);
  }

  return (
    <div className="relative h-[clamp(11rem,28vh,18rem)] w-full sm:h-[clamp(13rem,32vh,22rem)] lg:h-[clamp(15rem,34vh,26rem)]">
      <div
        className="h-full w-full bg-cover bg-center transition-[background-image] duration-500"
        style={{ backgroundImage: `url(${SLIDES[currentIndex]})` }}
        role="img"
        aria-label={`Foto de la carta ${currentIndex + 1} de ${SLIDES.length}`}
      />

      <button
        type="button"
        aria-label="Foto anterior"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 z-[1] -translate-y-1/2 rounded-full bg-stone-900/35 p-2 text-white transition hover:bg-stone-900/55 sm:left-4 sm:p-2.5"
      >
        <BsChevronCompactLeft className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
      <button
        type="button"
        aria-label="Foto siguiente"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 z-[1] -translate-y-1/2 rounded-full bg-stone-900/35 p-2 text-white transition hover:bg-stone-900/55 sm:right-4 sm:p-2.5"
      >
        <BsChevronCompactRight className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
    </div>
  );
}
