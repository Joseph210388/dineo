"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineCheckCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import Popup from "../popup/popup";
import PaymentMethodPicker from "../payment-method-picker/payment-method-picker";
import TablePicker from "../cart/table-picker";
import { createStaffReservationAction } from "../../backend/actions/staff";
import { formatMoney } from "../../backend/staff-format";
import { DEFAULT_PAYMENT_METHOD } from "../../lib/payment-methods";
import {
  DEFAULT_DIETARY,
  DEFAULT_TABLE_TYPE,
  DIETARY_OPTIONS,
  TABLE_TYPES,
} from "../../lib/reservation-preferences";

const STEPS = [
  { id: "food", title: "Comida", hint: "Elige platos (opcional)" },
  { id: "customer", title: "Cliente", hint: "A nombre de quién" },
  { id: "details", title: "Detalles", hint: "Fecha, mesa y pago" },
  { id: "success", title: "Listo", hint: "Reserva creada" },
];

const fieldClass =
  "mt-1 w-full rounded-xl border border-stone-300/80 bg-cream px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-red-700 focus:bg-white";

export default function StaffNewReservationPopup({
  isOpen,
  onClose,
  customers,
  dishes,
  tables,
  defaultDate,
  onCreated,
  catalogLoading = false,
  catalogError = false,
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [slideDir, setSlideDir] = useState("next");
  const [animKey, setAnimKey] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const [quantities, setQuantities] = useState({});
  const [guestMode, setGuestMode] = useState("existing");
  const [customerId, setCustomerId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [date, setDate] = useState(defaultDate || "");
  const [time, setTime] = useState("20:00");
  const [people, setPeople] = useState(2);
  const [tableId, setTableId] = useState("");
  const [tableType, setTableType] = useState(DEFAULT_TABLE_TYPE);
  const [dietaryNote, setDietaryNote] = useState(DEFAULT_DIETARY);
  const [kitchenNote, setKitchenNote] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setSlideDir("next");
    setAnimKey((k) => k + 1);
    setError("");
    setSaving(false);
    setCreatedId(null);
    setQuantities({});
    setGuestMode(customers.length ? "existing" : "new");
    setCustomerId("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setDate(defaultDate || new Date().toISOString().slice(0, 10));
    setTime("20:00");
    setPeople(2);
    setTableId("");
    setTableType(DEFAULT_TABLE_TYPE);
    setDietaryNote(DEFAULT_DIETARY);
    setKitchenNote("");
    setNotes("");
    setPaymentMethod(DEFAULT_PAYMENT_METHOD);
  }, [isOpen, defaultDate, customers.length]);

  const foodTotal = useMemo(() => {
    return dishes.reduce((sum, dish) => {
      const qty = Number(quantities[dish.id] || 0);
      return sum + qty * Number(dish.price || 0);
    }, 0);
  }, [dishes, quantities]);

  const selectedFoodCount = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + Number(qty || 0), 0),
    [quantities]
  );

  function goTo(nextStep) {
    setSlideDir(nextStep > step ? "next" : "prev");
    setStep(nextStep);
    setAnimKey((k) => k + 1);
    setError("");
  }

  function validateCurrent() {
    if (step === 0) {
      return true;
    }
    if (step === 1) {
      if (guestMode === "existing") {
        if (!customerId) {
          setError("Elige un cliente de la lista");
          return false;
        }
      } else {
        if (!firstName.trim() || !email.trim() || !email.includes("@")) {
          setError("Nombre y correo válidos son obligatorios");
          return false;
        }
      }
      return true;
    }
    if (step === 2) {
      if (!date || !time || Number(people) < 1) {
        setError("Completa fecha, hora y número de personas");
        return false;
      }
      return true;
    }
    return true;
  }

  function handleNext() {
    if (!validateCurrent()) return;
    if (step < STEPS.length - 2) {
      goTo(step + 1);
    }
  }

  function handleBack() {
    if (step > 0 && step < STEPS.length - 1) {
      goTo(step - 1);
    }
  }

  async function handleSubmit() {
    if (!validateCurrent()) return;
    setSaving(true);
    setError("");

    const data = new FormData();
    data.set("guestMode", guestMode === "new" ? "new" : "existing");
    if (guestMode === "existing") {
      data.set("customerId", customerId);
    } else {
      data.set("firstName", firstName.trim());
      data.set("lastName", lastName.trim());
      data.set("email", email.trim());
      data.set("phone", phone.trim());
      data.set("address", address.trim());
    }
    data.set("date", date);
    data.set("time", time);
    data.set("people", String(people));
    data.set("tableId", tableId);
    data.set("tableType", tableType);
    data.set("dietaryNote", dietaryNote);
    data.set("kitchenNote", kitchenNote);
    data.set("notes", notes);
    data.set("paymentMethod", paymentMethod);
    for (const dish of dishes) {
      data.set(`qty_${dish.id}`, String(quantities[dish.id] || 0));
    }

    const result = await createStaffReservationAction(data);
    setSaving(false);
    if (!result.ok) {
      setError(result.message || "No se pudo crear la reserva");
      return;
    }

    setCreatedId(result.id);
    goTo(3);
    onCreated?.(result.id);
  }

  const stepMeta = STEPS[step];
  const isSuccess = step === 3;

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title={isSuccess ? "Reserva creada" : `Nueva reserva · ${stepMeta.title}`}
      showClose
      closePosition="bar"
      headerTone="brand"
      maxWidthClass="max-w-[min(40rem,96vw)]"
      panelBgClass="bg-cream"
      overflowMode="none"
      panelClassName="flex min-h-0 flex-col px-4 pb-5 pt-3 sm:px-6 sm:pb-6"
      zClass="z-[80]"
    >
      {!isSuccess ? (
        <ol className="mb-4 flex gap-1.5" aria-label="Progreso">
          {STEPS.slice(0, 3).map((item, index) => (
            <li
              key={item.id}
              className={`h-1.5 flex-1 rounded-full ${
                index <= step ? "bg-red-800" : "bg-stone-200"
              }`}
            />
          ))}
        </ol>
      ) : null}

      <div className="relative min-h-[22rem] overflow-hidden sm:min-h-[24rem]">
        <div
          key={animKey}
          className={`absolute inset-0 flex flex-col ${
            slideDir === "next" ? "animate-step-push-in" : "animate-step-push-in-prev"
          }`}
        >
          {step === 0 ? (
            <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
              <p className="text-sm text-stone-600">{stepMeta.hint}. Puedes dejarlo vacío.</p>
              {catalogLoading ? (
                <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
                  Cargando carta…
                </p>
              ) : catalogError ? (
                <p className="mt-6 rounded-xl border border-dashed border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-800">
                  No se pudo cargar la carta. Puedes continuar y elegir cliente/mesa; los platos
                  quedarán vacíos.
                </p>
              ) : dishes.length === 0 ? (
                <p className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
                  No hay platos disponibles en la carta.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {dishes.map((dish) => (
                    <li key={dish.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-800">{dish.name}</p>
                        <p className="text-xs text-stone-500">{formatMoney(dish.price)}</p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={quantities[dish.id] || 0}
                        onChange={(event) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [dish.id]: Math.max(0, Number(event.target.value) || 0),
                          }))
                        }
                        className="w-16 shrink-0 rounded-lg border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-red-700"
                        aria-label={`Cantidad de ${dish.name}`}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {!catalogLoading ? (
                <p className="mt-3 text-sm text-stone-600">
                  {selectedFoodCount} uds · subtotal {formatMoney(foodTotal)}
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
              <p className="text-sm text-stone-600">{stepMeta.hint}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGuestMode("existing")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    guestMode === "existing"
                      ? "border-red-800 bg-red-50 text-red-900"
                      : "border-stone-300 bg-white text-stone-600"
                  }`}
                >
                  Cliente existente
                </button>
                <button
                  type="button"
                  onClick={() => setGuestMode("new")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    guestMode === "new"
                      ? "border-red-800 bg-red-50 text-red-900"
                      : "border-stone-300 bg-white text-stone-600"
                  }`}
                >
                  Cliente nuevo
                </button>
              </div>

              {guestMode === "existing" ? (
                catalogLoading ? (
                  <p className="rounded-xl border border-dashed border-stone-300 bg-white px-3 py-4 text-sm text-stone-500">
                    Cargando clientes…
                  </p>
                ) : customers.length ? (
                  <label className="block text-sm font-medium text-stone-700">
                    Cliente
                    <select
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                      className={fieldClass}
                    >
                      <option value="">Elige un cliente</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} · {customer.email}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="rounded-xl border border-dashed border-stone-300 bg-white px-3 py-4 text-sm text-stone-500">
                    No hay clientes. Usa «Cliente nuevo».
                  </p>
                )
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-stone-700 sm:col-span-1">
                    Nombre
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block text-sm font-medium text-stone-700">
                    Apellidos
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                    Correo
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-700">
                    Teléfono
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block text-sm font-medium text-stone-700">
                    Dirección
                    <input value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
                  </label>
                </div>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
              <p className="text-sm text-stone-600">{stepMeta.hint}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block text-sm font-medium text-stone-700">
                  Fecha
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTableId("");
                    }}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium text-stone-700">
                  Hora
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      setTableId("");
                    }}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-medium text-stone-700">
                  Personas
                  <input
                    type="number"
                    min="1"
                    value={people}
                    onChange={(e) => {
                      setPeople(Math.max(1, Number(e.target.value) || 1));
                      setTableId("");
                    }}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white/70 p-3">
                <TablePicker
                  date={date}
                  time={time}
                  people={people}
                  value={tableId}
                  onChange={(id, table) => {
                    setTableId(id);
                    if (table?.zone && TABLE_TYPES.some((item) => item.id === table.zone)) {
                      setTableType(table.zone);
                    }
                    if (table?.capacity && people > table.capacity) {
                      setPeople(table.capacity);
                    }
                  }}
                  onPeopleSuggest={(count) => setPeople(count)}
                />
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
                  onClick={() => setTableId("")}
                >
                  Quitar mesa (solo zona preferida)
                </button>
              </div>

              {!tableId ? (
                <label className="block text-sm font-medium text-stone-700">
                  Zona preferida
                  <select
                    value={tableType}
                    onChange={(e) => setTableType(e.target.value)}
                    className={fieldClass}
                  >
                    {TABLE_TYPES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block text-sm font-medium text-stone-700">
                Dietética
                <select
                  value={dietaryNote}
                  onChange={(e) => setDietaryNote(e.target.value)}
                  className={fieldClass}
                >
                  {DIETARY_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

              <label className="block text-sm font-medium text-stone-700">
                Nota cocina
                <input
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  placeholder="Sin sal, diabetes…"
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                Notas internas
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={fieldClass}
                  placeholder="Observaciones del local…"
                />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
              <HiOutlineCheckCircle className="h-14 w-14 text-emerald-600" aria-hidden />
              <h3 className="mt-3 text-xl font-semibold text-stone-900">¡Reserva creada!</h3>
              <p className="mt-2 max-w-sm text-sm text-stone-600">
                La mesa ya figura en el plano del día. Puedes ver el detalle o seguir en el listado.
              </p>
              <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
                {createdId ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose?.();
                      router.push(`/staff/reservations/${createdId}`);
                    }}
                    className="rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-white hover:bg-red-900"
                  >
                    Ver reserva
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      {!isSuccess ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || saving}
            className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40"
          >
            <HiOutlineChevronLeft className="h-4 w-4" />
            Atrás
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
            >
              Continuar
              <HiOutlineChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-60"
            >
              {saving ? "Creando…" : "Crear reserva"}
            </button>
          )}
        </div>
      ) : null}
    </Popup>
  );
}
