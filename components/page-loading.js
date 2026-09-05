export default function PageLoading({ variant = "public" }) {
  const isStaff = variant === "staff";

  return (
    <div
      className={`flex min-h-[50svh] w-full items-center justify-center px-4 ${
        isStaff ? "bg-stone-100" : "bg-cream"
      }`}
    >
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <span
          className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
            isStaff ? "border-stone-400" : "border-red-800"
          }`}
        />
        <p className={`text-sm ${isStaff ? "text-stone-500" : "text-stone-600"}`}>Cargando…</p>
      </div>
    </div>
  );
}
