"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineCamera, HiOutlineTrash } from "react-icons/hi";
import {
  changePasswordAction,
  deleteAccountAction,
  updateProfileAction,
} from "../../backend/actions/user";
import { uploadImage } from "../../backend/actions/storage";
import { fileToCompressedJpegFile } from "../../lib/image-file";
import { useAuth } from "../auth-provider";
import ConfirmPopup from "../popup/confirm-popup";
import Popup from "../popup/popup";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-cream px-3.5 py-2.5 text-sm text-stone-800 outline-none ring-red-700/15 transition placeholder:text-stone-400 focus:border-red-700 focus:bg-white focus:ring-4";

function userInitials(user) {
  return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
}

function Field({ label, htmlFor, className = "", children }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-stone-700 ${className}`.trim()}>
      {label}
      {children}
    </label>
  );
}

export default function ProfilePopup({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhotoUrl(user.photo || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setDeletePassword("");
    setMessage("");
    setError("");
    setConfirmDelete(false);
  }, [isOpen, user]);

  if (!user) {
    return null;
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploadingPhoto) {
      return;
    }

    setError("");
    setUploadingPhoto(true);
    try {
      const jpeg = await fileToCompressedJpegFile(file, {
        maxSide: 480,
        quality: 0.8,
        maxBytes: 450_000,
      });
      const body = new FormData();
      body.set("file", jpeg);
      body.set("folder", "avatars");
      const result = await uploadImage(body);
      if (!result.ok || !result.url) {
        throw new Error(result.error || "No se pudo subir la foto");
      }
      setPhotoUrl(result.url);
    } catch (err) {
      setError(err.message || "No se pudo cargar la foto");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const result = await updateProfileAction({
      firstName,
      lastName,
      email,
      photoUrl: photoUrl || null,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.message || "No se pudo guardar el perfil");
      return;
    }

    await refreshUser();
    setMessage("Perfil actualizado");
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y la confirmación no coinciden");
      return;
    }

    setChangingPassword(true);
    const result = await changePasswordAction({
      currentPassword,
      newPassword,
    });
    setChangingPassword(false);

    if (!result.ok) {
      setError(result.message || "No se pudo cambiar la contraseña");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Contraseña actualizada");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setError("");
    const result = await deleteAccountAction({ password: deletePassword });
    setDeleting(false);

    if (!result.ok) {
      setError(result.message || "No se pudo eliminar la cuenta");
      setConfirmDelete(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <>
      <Popup
        isOpen={isOpen}
        onClose={onClose}
        title="Mi perfil"
        showClose
        closePosition="bar"
        headerTone="brand"
        maxWidthClass="max-w-[min(72rem,96vw)]"
        panelBgClass="bg-cream"
        overflowMode="none"
        panelClassName="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-4 lg:px-8"
        zClass="z-[75]"
        listenEscape={!confirmDelete}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="thin-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-1 pb-2">
            <div className="grid gap-4 lg:grid-cols-[minmax(11rem,16rem)_minmax(0,1fr)] lg:items-start">
              <aside className="flex flex-col gap-2.5 rounded-2xl border border-stone-300/70 bg-stone-200/40 p-2.5 sm:p-3">
                <p className="text-sm font-medium text-stone-700">Foto</p>
                <div className="relative mx-auto w-fit">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt=""
                      className="h-28 w-28 max-w-full rounded-2xl object-cover sm:h-32 sm:w-32"
                    />
                  ) : (
                    <span className="flex h-28 w-28 items-center justify-center rounded-2xl bg-red-800 text-2xl font-semibold text-white sm:h-32 sm:w-32">
                      {userInitials({ firstName, lastName })}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white shadow disabled:opacity-60"
                    aria-label={uploadingPhoto ? "Subiendo foto" : "Cambiar foto"}
                  >
                    <HiOutlineCamera className="h-4 w-4" aria-hidden />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                <p className="text-center text-xs text-stone-500">
                  {uploadingPhoto ? "Subiendo a Storage…" : "JPG o PNG. Se guarda en Storage."}
                </p>
                {photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="rounded-xl border border-red-300/80 bg-cream px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border border-stone-300 bg-cream px-3 py-2 text-sm font-medium text-stone-800 hover:bg-white"
                  >
                    Añadir foto
                  </button>
                )}
              </aside>

              <div className="grid gap-3 rounded-2xl border border-stone-200/90 bg-stone-50/90 p-3 sm:grid-cols-2 sm:p-4">
                <form id="profile-save-form" onSubmit={handleSaveProfile} className="contents">
                  <Field label="Nombre" htmlFor="profileFirstName">
                    <input
                      id="profileFirstName"
                      className={inputClass}
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field label="Apellidos" htmlFor="profileLastName">
                    <input
                      id="profileLastName"
                      className={inputClass}
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      autoComplete="family-name"
                    />
                  </Field>
                  <Field label="Correo" htmlFor="profileEmail" className="sm:col-span-2">
                    <input
                      id="profileEmail"
                      type="email"
                      className={inputClass}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                    />
                  </Field>
                </form>

                <form
                  id="profile-password-form"
                  onSubmit={handleChangePassword}
                  className="grid gap-3 sm:col-span-2 sm:grid-cols-3"
                >
                  <p className="text-sm font-medium text-stone-700 sm:col-span-3">Cambiar contraseña</p>
                  <Field label="Contraseña actual" htmlFor="profileCurrentPassword">
                    <input
                      id="profileCurrentPassword"
                      type="password"
                      className={inputClass}
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </Field>
                  <Field label="Nueva contraseña" htmlFor="profileNewPassword">
                    <input
                      id="profileNewPassword"
                      type="password"
                      className={inputClass}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </Field>
                  <Field label="Confirmar nueva" htmlFor="profileConfirmPassword">
                    <input
                      id="profileConfirmPassword"
                      type="password"
                      className={inputClass}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </Field>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="rounded-xl border border-stone-300 bg-cream px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-white disabled:opacity-60"
                    >
                      {changingPassword ? "Actualizando…" : "Actualizar contraseña"}
                    </button>
                  </div>
                </form>

                <div className="sm:col-span-2">
                  <Field label="Confirmar eliminación (contraseña)" htmlFor="profileDeletePassword">
                    <input
                      id="profileDeletePassword"
                      type="password"
                      className={inputClass}
                      value={deletePassword}
                      onChange={(event) => setDeletePassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="Necesaria para eliminar la cuenta"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          </div>

          <div className="mt-1 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-300/70 px-0 pt-4">
            <button
              type="button"
              disabled={!deletePassword || deleting}
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-300/80 bg-cream px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
            >
              <HiOutlineTrash className="h-4 w-4" aria-hidden />
              Eliminar cuenta
            </button>
            <button
              type="submit"
              form="profile-save-form"
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
        title="¿Eliminar tu cuenta?"
        description="Perderás el acceso a favoritos, carrito y reservas con esta cuenta. Esta acción no se puede deshacer fácilmente."
        itemName={`${firstName} ${lastName}`.trim() || user.email}
        itemImage={photoUrl || undefined}
        confirmLabel={deleting ? "Eliminando…" : "Sí, eliminar"}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}
