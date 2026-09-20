"use client";

import { useEffect, useState } from "react";
import { HiOutlineCalendar, HiOutlineLockClosed } from "react-icons/hi";
import {
  removeStaffUserPopupAction,
  saveStaffUserPopupAction,
  setStaffUserPasswordAction,
} from "../../backend/actions/staff";
import { formatDate, formatMoney, userRoleLabel } from "../../backend/staff-format";
import ConfirmPopup from "../popup/confirm-popup";
import Popup from "../popup/popup";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-cream px-3.5 py-2.5 text-sm text-stone-800 outline-none ring-red-700/15 transition placeholder:text-stone-400 focus:border-red-700 focus:bg-white focus:ring-4";

function Field({ label, htmlFor, className = "", children }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-stone-700 ${className}`.trim()}>
      {label}
      {children}
    </label>
  );
}

function userInitials(user) {
  return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
}

export default function StaffUserProfilePopup({
  user,
  isOpen,
  onClose,
  currentUserId,
  onSaved,
  onOpenReservations,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [isActive, setIsActive] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isSelf = Boolean(user && currentUserId && String(user.id) === String(currentUserId));

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setRole(user.role || "customer");
    setIsActive(user.isActive !== false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
    setConfirmDelete(false);
  }, [isOpen, user]);

  if (!user) {
    return null;
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const result = await saveStaffUserPopupAction({
      id: user.id,
      firstName,
      lastName,
      email,
      role,
      isActive,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.message || "No se pudo guardar");
      return;
    }

    setMessage("Perfil actualizado");
    onSaved?.();
  }

  async function handlePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y la confirmación no coinciden");
      return;
    }

    setSavingPassword(true);
    const result = await setStaffUserPasswordAction({
      id: user.id,
      newPassword,
    });
    setSavingPassword(false);

    if (!result.ok) {
      setError(result.message || "No se pudo cambiar la contraseña");
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setMessage("Contraseña actualizada");
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    const result = await removeStaffUserPopupAction({ id: user.id });
    setDeleting(false);

    if (!result.ok) {
      setError(result.message || "No se pudo eliminar");
      setConfirmDelete(false);
      return;
    }

    setConfirmDelete(false);
    onClose?.();
    onSaved?.();
  }

  const title = `${firstName} ${lastName}`.trim() || user.email;

  return (
    <>
      <Popup
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        showClose
        closePosition="bar"
        headerTone="brand"
        maxWidthClass="max-w-[min(72rem,96vw)]"
        panelBgClass="bg-cream"
        overflowMode="none"
        panelClassName="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-4 lg:px-8"
        zClass="z-[80]"
        listenEscape={!confirmDelete}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="thin-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-2">
            <div className="grid gap-4 lg:grid-cols-[minmax(11rem,16rem)_minmax(0,1fr)] lg:items-start">
              <aside className="flex flex-col gap-2.5 rounded-2xl border border-stone-300/70 bg-stone-200/40 p-2.5 sm:p-3">
                <p className="text-sm font-medium text-stone-700">Perfil</p>
                <div className="mx-auto">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt=""
                      className="h-28 w-28 max-w-full rounded-2xl object-cover sm:h-32 sm:w-32"
                    />
                  ) : (
                    <span className="flex h-28 w-28 items-center justify-center rounded-2xl bg-red-800 text-2xl font-semibold text-white sm:h-32 sm:w-32">
                      {userInitials({ firstName, lastName })}
                    </span>
                  )}
                </div>
                <p className="text-center text-xs text-stone-500">
                  Alta {formatDate(user.createdAt)}
                </p>
                {typeof user.reservationCount === "number" ? (
                  <p className="text-center text-xs text-stone-600">
                    {user.reservationCount} reservas · {formatMoney(user.spent || 0)}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => onOpenReservations?.(user)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-cream px-3 py-2 text-sm font-medium text-stone-800 hover:bg-white"
                >
                  <HiOutlineCalendar className="h-4 w-4" aria-hidden />
                  Ver reservas
                </button>
              </aside>

              <div className="grid gap-3 rounded-2xl border border-stone-200/90 bg-stone-50/90 p-3 sm:grid-cols-2 sm:p-4">
                <form id="staff-user-save-form" onSubmit={handleSave} className="contents">
                  <Field label="Nombre" htmlFor="staffUserFirstName">
                    <input
                      id="staffUserFirstName"
                      className={inputClass}
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Apellidos" htmlFor="staffUserLastName">
                    <input
                      id="staffUserLastName"
                      className={inputClass}
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Correo" htmlFor="staffUserEmail" className="sm:col-span-2">
                    <input
                      id="staffUserEmail"
                      type="email"
                      className={inputClass}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Rol" htmlFor="staffUserRole">
                    <div className="relative">
                      <select
                        id="staffUserRole"
                        className={inputClass}
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        disabled={isSelf}
                      >
                        <option value="customer">Cliente</option>
                        <option value="employee">Empleado</option>
                        <option value="admin">Admin</option>
                      </select>
                      {isSelf ? (
                        <span
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                          title="Tu cuenta: el rol no se puede cambiar aquí"
                        >
                          <HiOutlineLockClosed className="h-4 w-4" aria-hidden />
                        </span>
                      ) : null}
                    </div>
                    {isSelf ? (
                      <p className="mt-1 text-xs text-stone-500">
                        Tu cuenta ({userRoleLabel(role)}) está bloqueada para cambiar de rol.
                      </p>
                    ) : null}
                  </Field>
                  <label className="flex items-center gap-2 self-end pb-1 text-sm font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(event) => setIsActive(event.target.checked)}
                      disabled={isSelf}
                      className="h-4 w-4 rounded border-stone-300 text-red-800 focus:ring-red-700"
                    />
                    Cuenta activa
                  </label>
                </form>

                <form
                  onSubmit={handlePassword}
                  className="grid gap-3 border-t border-stone-200/80 pt-3 sm:col-span-2 sm:grid-cols-2"
                >
                  <p className="text-sm font-medium text-stone-700 sm:col-span-2">Cambiar contraseña</p>
                  <Field label="Nueva contraseña" htmlFor="staffUserNewPassword">
                    <input
                      id="staffUserNewPassword"
                      type="password"
                      className={inputClass}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      minLength={8}
                      required
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field label="Confirmar" htmlFor="staffUserConfirmPassword">
                    <input
                      id="staffUserConfirmPassword"
                      type="password"
                      className={inputClass}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      minLength={8}
                      required
                      autoComplete="new-password"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="rounded-xl border border-stone-300 bg-cream px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-white disabled:opacity-60"
                    >
                      {savingPassword ? "Actualizando…" : "Actualizar contraseña"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          </div>

          <div className="mt-1 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-300/70 px-0 pt-4">
            {isSelf ? (
              <span className="text-xs text-stone-500">No puedes eliminar tu propia cuenta.</span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-xl border border-red-300/80 bg-cream px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-50"
              >
                Eliminar cuenta
              </button>
            )}
            <button
              type="submit"
              form="staff-user-save-form"
              disabled={saving}
              className="rounded-xl bg-red-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-900 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Popup>

      <ConfirmPopup
        isOpen={confirmDelete}
        title="¿Eliminar esta cuenta?"
        description="Se borrará el usuario y sus datos asociados. No se puede deshacer."
        itemName={title}
        itemImage={user.photo || undefined}
        confirmLabel={deleting ? "Eliminando…" : "Eliminar cuenta"}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
