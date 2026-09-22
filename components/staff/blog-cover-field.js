"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlinePhotograph, HiOutlineUpload } from "react-icons/hi";
import { uploadImage } from "../../backend/actions/storage";
import { fileToCompressedJpegFile } from "../../lib/image-file";

/** Portada de entrada de blog: sube a Storage (bucket blog). */
export default function BlogCoverField({ value = "", onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlOpen, setUrlOpen] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  useEffect(() => {
    setError("");
  }, [value]);

  async function onFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;

    setUploading(true);
    setError("");
    try {
      const jpeg = await fileToCompressedJpegFile(file, { maxSide: 1400, quality: 0.8 });
      const body = new FormData();
      body.set("file", jpeg);
      body.set("folder", "blog");
      const result = await uploadImage(body);
      if (!result.ok || !result.url) {
        throw new Error(result.error || "No se pudo subir la imagen");
      }
      onChange?.(result.url);
    } catch (err) {
      setError(err.message || "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="coverImageUrl" value={value || ""} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <div className="overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
        {value ? (
          <img src={value} alt="" className="h-36 w-full max-w-full object-cover sm:h-40" />
        ) : (
          <div className="flex h-36 flex-col items-center justify-center gap-1 text-stone-500 sm:h-40">
            <HiOutlinePhotograph className="h-7 w-7" />
            <p className="text-xs">Sin portada</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-cream px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-60"
        >
          <HiOutlineUpload className="h-3.5 w-3.5" />
          {uploading ? "Subiendo…" : "Subir portada"}
        </button>
        <button
          type="button"
          onClick={() => setUrlOpen((open) => !open)}
          className="rounded-lg border border-stone-300 bg-cream px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
        >
          URL
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange?.("")}
            className="rounded-lg border border-red-200 bg-cream px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-50"
          >
            Quitar
          </button>
        ) : null}
      </div>

      {urlOpen ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={urlValue}
            onChange={(event) => setUrlValue(event.target.value)}
            placeholder="https://…"
            className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-red-700"
          />
          <button
            type="button"
            onClick={() => {
              onChange?.(urlValue.trim());
              setUrlOpen(false);
              setUrlValue("");
            }}
            className="rounded-lg bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-900"
          >
            Usar URL
          </button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
