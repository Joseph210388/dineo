export default function ShowMoreButton({ remaining, onClick, className = "" }) {
  if (remaining <= 0) {
    return null;
  }

  return (
    <div className={`mt-4 flex justify-center ${className}`.trim()}>
      <button
        type="button"
        onClick={onClick}
        className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-red-700 hover:text-red-800"
      >
        Ver más ({remaining} más)
      </button>
    </div>
  );
}
