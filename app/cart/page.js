"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { getCartItems, deleteCartItem, updateCartItemQuantity } from "../../backend/actions/cart";
import { listCartSuggestDishes, getDishById } from "../../backend/actions/dish";
import { createReservation } from "../../backend/actions/reservation";
import { formatMoney } from "../../backend/staff-format";
import { CART_CHANGED_EVENT, notifyCartChanged } from "../../lib/cart-events";
import { DEFAULT_PAYMENT_METHOD } from "../../lib/payment-methods";
import { DEFAULT_DIETARY } from "../../lib/reservation-preferences";
import { toast } from "../../lib/toast";
import { useAuth } from "../../components/auth-provider";
import PaymentCheckout from "../../components/payment-method-picker/payment-checkout";
import CheckoutStepper from "../../components/cart/checkout-stepper";
import PreferencePicker from "../../components/cart/preference-picker";
import TablePicker from "../../components/cart/table-picker";
import ReservationSuccess from "../../components/cart/reservation-success";
import CartSuggestCarousel from "../../components/cart-button/cart-suggest-carousel";
import DishPopup from "../../components/dish-popup/dish-popup";
import useDishPopup from "../../components/dish-popup/use-dish-popup";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-red-700 focus:ring-4 focus:ring-red-700/15";

const compactFieldClass =
  "mt-1 w-full min-w-0 rounded-lg border border-stone-300/80 bg-white px-2 py-1.5 text-xs text-stone-800 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-700/15 sm:text-sm";

function minReservationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split("T")[0];
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function looksLikePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 9;
}

export default function Cart() {
  const { user } = useAuth();
  const userId = user?.id;
  const clientName = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Cliente",
    [user?.firstName, user?.lastName]
  );
  const clientEmail = user?.email || "";

  const [cartItems, setCartItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [selectedTableCapacity, setSelectedTableCapacity] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);
  const [dietaryNote, setDietaryNote] = useState(DEFAULT_DIETARY);
  const [kitchenNote, setKitchenNote] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [nameMode, setNameMode] = useState("self");
  const [guestName, setGuestName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [reservationDone, setReservationDone] = useState(null);
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const [removedNotice, setRemovedNotice] = useState("");
  const noticeTimer = useRef(null);
  const skipRefresh = useRef(false);
  const { selectedDish, openDish, closeDish } = useDishPopup();

  async function loadSuggestions(items) {
    try {
      const excludeIds = (items || []).map((item) => item.dishId);
      const next = await listCartSuggestDishes(excludeIds, 12);
      setSuggestions(Array.isArray(next) ? next : []);
    } catch {
      setSuggestions([]);
    }
  }

  async function refreshCartItems() {
    if (!userId) {
      setCartItems([]);
      setSuggestions([]);
      return;
    }
    try {
      const items = await getCartItems();
      const list = Array.isArray(items) ? items : [];
      setCartItems(list);
      await loadSuggestions(list);
    } catch (error) {
      console.error("Error al obtener los platillos del carrito:", error);
    }
  }

  useEffect(() => {
    refreshCartItems();

    function onCartChanged() {
      if (skipRefresh.current) {
        return;
      }
      refreshCartItems();
    }

    window.addEventListener(CART_CHANGED_EVENT, onCartChanged);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, onCartChanged);
      clearTimeout(noticeTimer.current);
    };
  }, [userId]);

  useEffect(() => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.dishPrice * item.quantity;
    });
    setTotalPrice(total);
  }, [cartItems]);

  useEffect(() => {
    const nameOk = nameMode === "self" || guestName.trim().length >= 2;
    const emailValue = nameMode === "self" ? clientEmail : contactEmail.trim();
    const emailOk = looksLikeEmail(emailValue);
    const phoneOk = looksLikePhone(contactPhone);
    setIsFormValid(
      Boolean(
        reservationDate &&
          reservationTime &&
          numberOfPeople >= 1 &&
          selectedTableId &&
          nameOk &&
          emailOk &&
          phoneOk
      )
    );
  }, [
    reservationDate,
    reservationTime,
    numberOfPeople,
    selectedTableId,
    nameMode,
    guestName,
    contactPhone,
    contactEmail,
    clientEmail,
  ]);

  async function changeQuantity(index, delta) {
    const item = cartItems[index];
    if (!item) {
      return;
    }

    const nextQty = Math.min(10, Math.max(1, item.quantity + delta));
    if (nextQty === item.quantity) {
      return;
    }

    // Actualizamos la UI al momento y persistimos en el carrito
    setCartItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity: nextQty };
      return next;
    });

    try {
      await updateCartItemQuantity(item.dishId, nextQty);
      notifyCartChanged();
    } catch (error) {
      console.error("Error al actualizar la cantidad:", error);
      await refreshCartItems();
    }
  }

  async function handleDeleteItem(item) {
    if (!item?.dishId || removingIds.has(item.dishId)) {
      return;
    }

    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.add(item.dishId);
      return next;
    });

    skipRefresh.current = true;

    try {
      await deleteCartItem(null, item.dishId);
    } catch (error) {
      console.error("Error al eliminar el platillo del carrito:", error);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.dishId);
        return next;
      });
      skipRefresh.current = false;
      return;
    }

    // Dejamos que la fila se desvanezca antes de quitarla del DOM
    window.setTimeout(() => {
      let nextItems = [];
      setCartItems((prev) => {
        nextItems = prev.filter((row) => row.dishId !== item.dishId);
        return nextItems;
      });
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.dishId);
        return next;
      });
      setRemovedNotice(item.dishName);
      clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setRemovedNotice(""), 7000);
      // Fuera del setState: la server action no puede correr “mientras” se renderiza
      void loadSuggestions(nextItems);
      notifyCartChanged();
      skipRefresh.current = false;
    }, 450);
  }

  async function handleOpenDish(item) {
    if (!item?.dishId || removingIds.has(item.dishId)) {
      return;
    }
    try {
      const dish = await getDishById(item.dishId);
      if (dish) {
        openDish(dish);
      }
    } catch (error) {
      console.error("Error al abrir el plato:", error);
    }
  }

  async function completeReservation() {
    if (!isFormValid || isSubmitting || cartItems.length === 0) {
      return false;
    }

    try {
      setIsSubmitting(true);
      const reservedName = nameMode === "self" ? clientName : guestName.trim();
      const reservedEmail = nameMode === "self" ? clientEmail : contactEmail.trim();
      const formattedDishDetail = cartItems.map((item) => ({
        dishName: item.dishName,
        quantity: item.quantity,
      }));

      const created = await createReservation(
        userId,
        formattedDishDetail,
        totalPrice,
        reservationDate,
        reservationTime,
        numberOfPeople,
        paymentMethod,
        reservedName,
        contactPhone.trim(),
        reservedEmail,
        "salon",
        dietaryNote,
        kitchenNote,
        selectedTableId
      );

      notifyCartChanged();
      setCheckoutStep(3);
      setReservationDone({
        id: created?._id || created?.id || null,
        guestName: reservedName,
        date: reservationDate,
        time: reservationTime,
        people: numberOfPeople,
        total: totalPrice,
      });
      setCartItems([]);
      await loadSuggestions([]);
      return true;
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      toast.error(error?.message || "No se pudo completar la reserva. Inténtalo de nuevo.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // El envío real ocurre en el paso 2 (pago)
  }

  function goToPaymentStep() {
    if (!isFormValid || cartItems.length === 0) {
      toast.error("Completa los datos de la reserva antes de continuar.");
      return;
    }
    setCheckoutStep(2);
  }

  const tomorrowFormatted = minReservationDate();
  const totalUnits = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (reservationDone || checkoutStep === 3) {
    return (
      <div className="bg-cream">
        <div className="mx-auto w-full max-w-lg px-[4%] pt-8 md:px-[6%]">
          <CheckoutStepper step={3} />
        </div>
        <ReservationSuccess
          reservationId={reservationDone?.id}
          guestName={reservationDone?.guestName}
          date={reservationDone?.date}
          time={reservationDone?.time}
          people={reservationDone?.people}
          total={reservationDone?.total}
          autoRedirect
        />
      </div>
    );
  }

  return (
    <div className="bg-cream px-[4%] py-8 sm:py-10 md:px-[6%] md:py-12 lg:px-[8%]">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <section className="flex min-w-0 flex-1 flex-col lg:w-[58%]">
          <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-800/80">Reserva</p>
              <h1 className="mt-1.5 text-[clamp(1.5rem,3.5vw,2.15rem)] font-semibold leading-tight text-stone-900">
                Carrito de {clientName}
              </h1>
              <p className="mt-1.5 max-w-lg text-sm text-stone-500 sm:text-base">
                Revisa tu pedido y completa los datos para reservar mesa.
              </p>
            </div>
            <div className="shrink-0 self-start rounded-2xl border border-stone-200 bg-white px-4 py-3 text-right shadow-sm shadow-stone-900/5 sm:px-5 sm:py-3.5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-stone-500">
                Precio total
              </p>
              <p className="mt-0.5 text-xl font-bold text-stone-900 sm:text-2xl">
                {formatMoney(totalPrice)}
              </p>
            </div>
          </header>

          <div className="flex-1 rounded-2xl border border-stone-200/80 bg-white/70 p-4 shadow-sm shadow-stone-900/5 sm:p-5 md:p-6">
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-stone-100 pb-3">
              <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">Tu pedido</h2>
              <p className="text-sm text-stone-500">
                {totalUnits === 0
                  ? "Vacío"
                  : `${totalUnits} ${totalUnits === 1 ? "plato" : "platos"}`}
              </p>
            </div>

            {removedNotice ? (
              <p className="mb-3 animate-cart-notice-in border-y border-stone-200 py-2.5 text-sm text-stone-700">
                <span className="font-medium text-red-800">{removedNotice}</span>
                {" "}
                se ha eliminado de la cesta.
              </p>
            ) : null}

            {cartItems.length === 0 ? (
              <p className="py-10 text-center text-sm text-stone-500 sm:text-base">
                {removedNotice
                  ? "Tu cesta ha quedado vacía."
                  : "No hay platillos en el carrito. Explora la carta y añade algo rico."}
              </p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {cartItems.map((item, index) => {
                  const isRemoving = removingIds.has(item.dishId);

                  return (
                  <li
                    key={item.dishId}
                    className={`flex flex-col gap-3 overflow-hidden py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                      isRemoving ? "animate-cart-row-out pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="inline-flex items-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                        <button
                          type="button"
                          aria-label="Quitar uno"
                          disabled={isRemoving}
                          className="px-2.5 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50 sm:px-3"
                          onClick={() => changeQuantity(index, -1)}
                        >
                          −
                        </button>
                        <span className="min-w-8 px-1 text-center text-sm font-semibold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Añadir uno"
                          disabled={isRemoving}
                          className="px-2.5 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50 sm:px-3"
                          onClick={() => changeQuantity(index, 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
                        onClick={() => handleOpenDish(item)}
                      >
                        <img
                          src={item.dishImage}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-stone-900 underline-offset-2 hover:underline">
                            {item.dishName}
                          </p>
                          <p className="text-sm text-stone-500">{item.dishCategory}</p>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                      <p className="text-base font-bold text-stone-900 sm:text-lg">
                        {formatMoney(item.dishPrice * item.quantity)}
                      </p>
                      <button
                        type="button"
                        aria-label={`Eliminar ${item.dishName}`}
                        disabled={isRemoving}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-800 text-white transition hover:bg-red-900 disabled:opacity-50"
                        onClick={() => handleDeleteItem(item)}
                      >
                        <HiOutlineTrash className="h-5 w-5" aria-hidden />
                      </button>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <aside className="flex w-full lg:w-[42%]">
          <form
            onSubmit={handleSubmit}
            className="flex h-full w-full flex-col rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm shadow-stone-900/5 sm:p-5 md:p-6"
          >
            <CheckoutStepper step={checkoutStep} />
            <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
              {checkoutStep === 1 ? "Datos de la reserva" : "Forma de pago"}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {checkoutStep === 1
                ? "Completa tus datos, mesa y dietética. El pago es el siguiente paso."
                : "Elige cómo pagar. Tarjeta y Bizum son demo."}
            </p>

            {checkoutStep === 1 ? (
              <>
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-stone-800">¿A nombre de quién?</legend>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <label
                  className={`flex w-full min-w-0 cursor-pointer items-start gap-2 rounded-xl border px-2.5 py-2.5 transition sm:gap-3 sm:px-3 ${
                    nameMode === "self" ? "border-red-700 bg-red-50" : "border-stone-200 bg-stone-50/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="nameMode"
                    value="self"
                    checked={nameMode === "self"}
                    onChange={() => setNameMode("self")}
                    className="mt-1 shrink-0 accent-red-800"
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium leading-snug text-stone-800 sm:text-sm">
                      A nombre del cliente
                    </span>
                    <span className="mt-0.5 block text-[0.65rem] text-stone-500 sm:text-xs">
                      Tu cuenta, sin editar.
                    </span>
                  </span>
                </label>

                <label
                  className={`flex w-full min-w-0 cursor-pointer items-start gap-2 rounded-xl border px-2.5 py-2.5 transition sm:gap-3 sm:px-3 ${
                    nameMode === "other" ? "border-red-700 bg-red-50" : "border-stone-200 bg-stone-50/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="nameMode"
                    value="other"
                    checked={nameMode === "other"}
                    onChange={() => setNameMode("other")}
                    className="mt-1 shrink-0 accent-red-800"
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium leading-snug text-stone-800 sm:text-sm">
                      A nombre de otra persona
                    </span>
                    <span className="mt-0.5 block text-[0.65rem] text-stone-500 sm:text-xs">
                      Para alguien más.
                    </span>
                  </span>
                </label>
              </div>

              <div className="mt-3">
                <label htmlFor="guestName" className="text-sm font-semibold text-stone-800">
                  Nombre
                </label>
                {nameMode === "self" ? (
                  <input
                    id="guestName"
                    type="text"
                    value={clientName}
                    readOnly
                    className={`${fieldClass} cursor-default bg-stone-50 text-stone-700`}
                    tabIndex={-1}
                  />
                ) : (
                  <input
                    id="guestName"
                    type="text"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Nombre y apellidos"
                    className={fieldClass}
                    required
                    autoComplete="name"
                  />
                )}
              </div>
            </fieldset>

            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="min-w-0">
                  <label htmlFor="reservationDate" className="text-xs font-semibold text-stone-800">
                    Fecha
                  </label>
                  <input
                    id="reservationDate"
                    type="date"
                    value={reservationDate}
                    onChange={(event) => {
                      setReservationDate(event.target.value);
                      setSelectedTableId("");
                      setSelectedTableCapacity(null);
                    }}
                    min={tomorrowFormatted}
                    required
                    className={compactFieldClass}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="reservationTime" className="text-xs font-semibold text-stone-800">
                    Hora
                  </label>
                  <input
                    id="reservationTime"
                    type="time"
                    value={reservationTime}
                    onChange={(event) => {
                      setReservationTime(event.target.value);
                      setSelectedTableId("");
                      setSelectedTableCapacity(null);
                    }}
                    min="12:00"
                    max="23:59"
                    required
                    className={compactFieldClass}
                  />
                </div>
                <div className="col-span-2 min-w-0 sm:col-span-1">
                  <label htmlFor="numberOfPeople" className="text-xs font-semibold text-stone-800">
                    Comensales
                  </label>
                  <div className="mt-1 flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Menos personas"
                      className="flex h-8 w-7 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-white text-sm font-semibold text-stone-800 transition hover:border-red-700 hover:text-red-800"
                      onClick={() =>
                        setNumberOfPeople((value) => {
                          const next = Math.max(1, value - 1);
                          setSelectedTableId("");
                          setSelectedTableCapacity(null);
                          return next;
                        })
                      }
                    >
                      −
                    </button>
                    <input
                      id="numberOfPeople"
                      type="number"
                      value={numberOfPeople}
                      onChange={(event) => {
                        const next = Number.parseInt(event.target.value, 10);
                        const cappedMax = selectedTableCapacity || 20;
                        const safe =
                          Number.isFinite(next) && next >= 1 ? Math.min(cappedMax, next) : 1;
                        setNumberOfPeople(safe);
                        setSelectedTableId("");
                        setSelectedTableCapacity(null);
                      }}
                      min="1"
                      max={selectedTableCapacity || 20}
                      required
                      className={`${compactFieldClass} mt-0 text-center font-semibold`}
                    />
                    <button
                      type="button"
                      aria-label="Más personas"
                      className="flex h-8 w-7 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-white text-sm font-semibold text-stone-800 transition hover:border-red-700 hover:text-red-800"
                      onClick={() =>
                        setNumberOfPeople((value) => {
                          const cappedMax = selectedTableCapacity || 20;
                          const next = Math.min(cappedMax, value + 1);
                          setSelectedTableId("");
                          setSelectedTableCapacity(null);
                          return next;
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[0.65rem] text-red-800/90">
                Horario 12:00 – 23:59 · Elige mesa abajo (hover = zona y capacidad)
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3 sm:p-4">
              <TablePicker
                date={reservationDate}
                time={reservationTime}
                people={numberOfPeople}
                value={selectedTableId}
                onChange={(id, table) => {
                  setSelectedTableId(id);
                  setSelectedTableCapacity(table?.capacity ?? null);
                  if (table?.capacity && numberOfPeople > table.capacity) {
                    setNumberOfPeople(table.capacity);
                  }
                }}
                onPeopleSuggest={(count) => setNumberOfPeople(count)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="contactPhone" className="text-sm font-semibold text-stone-800">
                  Número de contacto
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="Ej. 600 123 456"
                  className={fieldClass}
                  required
                  autoComplete="tel"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="contactEmail" className="text-sm font-semibold text-stone-800">
                  Email
                </label>
                {nameMode === "self" ? (
                  <input
                    id="contactEmail"
                    type="email"
                    value={clientEmail}
                    readOnly
                    className={`${fieldClass} cursor-default bg-stone-50 text-stone-700`}
                    tabIndex={-1}
                  />
                ) : (
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={fieldClass}
                    required
                    autoComplete="email"
                  />
                )}
              </div>
            </div>

            <div className="mt-5">
              <PreferencePicker
                dietaryNote={dietaryNote}
                onDietaryNoteChange={setDietaryNote}
                kitchenNote={kitchenNote}
                onKitchenNoteChange={setKitchenNote}
              />
            </div>

            <div className="mt-auto border-t border-stone-100 pt-5">
              <button
                type="button"
                disabled={!isFormValid || cartItems.length === 0}
                onClick={goToPaymentStep}
                className="w-full rounded-xl bg-red-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                Continuar al pago
              </button>
            </div>
              </>
            ) : (
              <div className="mt-5 flex min-h-0 flex-1 flex-col">
                <PaymentCheckout
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  totalPrice={totalPrice}
                  canSubmit={isFormValid && cartItems.length > 0}
                  isSubmitting={isSubmitting}
                  onLocalPay={() => completeReservation()}
                  onDemoPay={() => completeReservation()}
                  onBack={() => setCheckoutStep(1)}
                />
              </div>
            )}
          </form>
        </aside>
      </div>

      <CartSuggestCarousel dishes={suggestions} onOpenDish={handleOpenDish} />

      {selectedDish ? (
        <DishPopup dish={selectedDish} onClose={closeDish} onOpenDish={openDish} />
      ) : null}
    </div>
  );
}
