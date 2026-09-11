"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLink,
  HiOutlinePhotograph,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUpload,
} from "react-icons/hi";
import { fileToCompressedDataUrl } from "../../lib/image-file";

function buildInitialImages(mainImage, extraImages) {
  const list = [mainImage, ...(extraImages || [])].map((item) => String(item || "").trim()).filter(Boolean);
  return list.length ? list : [];
}

export default function DishImageEditor({ mainImage = "", extraImages = [] }) {
  const fileRef = useRef(null);
  const [images, setImages] = useState(() => buildInitialImages(mainImage, extraImages));
  const [thumbIndex, setThumbIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [urlOpen, setUrlOpen] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const next = buildInitialImages(mainImage, extraImages);
    setImages(next);
    setThumbIndex(0);
    setActiveIndex(0);
  }, [mainImage, extraImages]);

  const current = images[activeIndex] || "";
  const extrasForSubmit = images.filter((_, index) => index !== thumbIndex);

  function showError(text) {
    setMessage(text);
  }

  function addImage(url) {
    const clean = String(url || "").trim();
    if (!clean) {
      return;
    }
    setImages((currentList) => {
      if (currentList.includes(clean)) {
        showError("Esa imagen ya está en la lista");
        return currentList;
      }
      const next = [...currentList, clean];
      setActiveIndex(next.length - 1);
      if (!currentList.length) {
        setThumbIndex(0);
      }
      return next;
    });
    setMessage("");
    setUrlOpen(false);
    setUrlValue("");
  }

  async function onFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      addImage(dataUrl);
    } catch (error) {
      showError(error.message || "No se pudo subir la imagen");
    }
  }

  function removeCurrent() {
    if (!images.length) {
      return;
    }
    setImages((currentList) => {
      const next = currentList.filter((_, index) => index !== activeIndex);
      const nextActive = Math.max(0, Math.min(activeIndex, next.length - 1));
      setActiveIndex(nextActive);
      setThumbIndex((currentThumb) => {
        if (!next.length) {
          return 0;
        }
        if (currentThumb === activeIndex) {
          return 0;
        }
        if (currentThumb > activeIndex) {
          return currentThumb - 1;
        }
        return currentThumb;
      });
      return next;
    });
  }

  function go(delta) {
    if (images.length < 2) {
      return;
    }
    setActiveIndex((currentActive) => (currentActive + delta + images.length) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="imageUrl" value={images[thumbIndex] || ""} />
      <input type="hidden" name="extraImages" value={extrasForSubmit.join("\n")} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="group relative overflow-hidden rounded-xl border border-stone-300/70 bg-stone-300/40 shadow-inner">
        {current ? (
          <img src={current} alt="" className="aspect-[4/3] w-full max-w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-stone-600">
            <HiOutlinePhotograph className="h-8 w-8 text-stone-400" />
            Pasa el ratón para añadir la primera foto
          </div>
        )}

        {/* En escritorio: acciones al hover. En móvil no tapamos la foto. */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-2 bg-stone-900/55 opacity-0 transition sm:flex sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl bg-cream px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-white"
          >
            <HiOutlineUpload className="h-4 w-4" />
            Subir
          </button>
          <button
            type="button"
            onClick={() => {
              setUrlOpen((open) => !open);
              setMessage("");
            }}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl bg-cream px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-white"
          >
            <HiOutlineLink className="h-4 w-4" />
            URL
          </button>
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-[1] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-stone-800 shadow"
            >
              <HiOutlineChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-[1] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-stone-800 shadow"
            >
              <HiOutlineChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {images.length ? (
          <span className="absolute bottom-2 left-2 rounded-lg bg-stone-900/70 px-2 py-1 text-[0.65rem] font-medium text-white">
            {activeIndex + 1} / {images.length}
            {activeIndex === thumbIndex ? " · Miniatura" : ""}
          </span>
        ) : null}
      </div>

      {urlOpen ? (
        <div className="rounded-xl border border-stone-300 bg-cream p-2">
          <label className="sr-only" htmlFor="dish-image-url">
            URL de la imagen
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="dish-image-url"
              value={urlValue}
              onChange={(event) => setUrlValue(event.target.value)}
              placeholder="https://…"
              className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-red-700"
            />
            <button
              type="button"
              onClick={() => addImage(urlValue)}
              className="rounded-lg bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-900"
            >
              Añadir
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-cream px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 sm:hidden"
        >
          <HiOutlineUpload className="h-3.5 w-3.5" />
          Subir
        </button>
        <button
          type="button"
          onClick={() => {
            setUrlOpen((open) => !open);
            setMessage("");
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-cream px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 sm:hidden"
        >
          <HiOutlineLink className="h-3.5 w-3.5" />
          URL
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="hidden items-center gap-1 rounded-lg border border-stone-300 bg-cream px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 sm:inline-flex"
        >
          <HiOutlinePlus className="h-3.5 w-3.5" />
          Añadir foto
        </button>
        {images.length ? (
          <>
            <button
              type="button"
              disabled={activeIndex === thumbIndex}
              onClick={() => setThumbIndex(activeIndex)}
              className="rounded-lg border border-stone-300 bg-cream px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-default disabled:opacity-50"
            >
              Usar como miniatura
            </button>
            <button
              type="button"
              onClick={removeCurrent}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-cream px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50"
            >
              <HiOutlineTrash className="h-3.5 w-3.5" />
              Quitar
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {images.map((src, index) => (
            <button
              key={`${src.slice(0, 48)}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 ${
                index === activeIndex ? "border-red-800" : "border-transparent"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              {index === thumbIndex ? (
                <span className="absolute inset-x-0 bottom-0 bg-red-800/90 text-[0.55rem] font-semibold text-white">
                  Mini
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {message ? <p className="text-xs text-red-700">{message}</p> : null}
      {!images.length ? (
        <p className="text-xs text-stone-500">Hace falta al menos una foto (subida o URL) para guardar.</p>
      ) : null}
    </div>
  );
}
