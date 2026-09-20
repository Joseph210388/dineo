"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineTrash,
} from "react-icons/hi";
import {
  getStaffUser,
  removeStaffUserPopupAction,
  setStaffUserPasswordAction,
  updateStaffUserRoleAction,
} from "../../backend/actions/staff";
import SearchInput from "../search-input/search-input";
import Pagination from "../pagination/pagination";
import ConfirmPopup from "../popup/confirm-popup";
import Popup from "../popup/popup";
import { matchesSearch, TABLE_PAGE_SIZE } from "../../lib/search-text";
import { usePaginator } from "../../lib/use-paginator";
import StaffUserProfilePopup from "./staff-user-profile-popup";
import StaffUserReservationsPopup from "./staff-user-reservations-popup";

const roleSelectClass =
  "w-full max-w-[9.5rem] rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-medium text-stone-700 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/20 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500";

const passwordInputClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-cream px-3.5 py-2.5 text-sm text-stone-800 outline-none focus:border-red-700 focus:bg-white focus:ring-4 focus:ring-red-700/15";

export default function StaffUsersBoard({ users, currentUserId }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [roleBusyId, setRoleBusyId] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [reservationsUser, setReservationsUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((user) =>
      matchesSearch(`${user.firstName} ${user.lastName} ${user.email} ${user.role}`, query)
    );
  }, [query, users]);

  const page = usePaginator(filtered, TABLE_PAGE_SIZE);

  async function openProfile(user) {
    const full = await getStaffUser(user.id);
    setProfileUser(full || user);
  }

  async function handleRoleChange(user, nextRole) {
    if (String(user.id) === String(currentUserId)) {
      return;
    }
    setRoleBusyId(user.id);
    const result = await updateStaffUserRoleAction({ id: user.id, role: nextRole });
    setRoleBusyId("");
    if (result.ok) {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!deleteUser) {
      return;
    }
    setDeleting(true);
    const result = await removeStaffUserPopupAction({ id: deleteUser.id });
    setDeleting(false);
    if (result.ok) {
      setDeleteUser(null);
      setProfileUser(null);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="max-w-xl">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Buscar usuario"
          placeholder="Nombre, correo o rol"
        />
      </div>
      <p className="mt-3 text-sm text-stone-500">
        {page.total} coinciden · página {page.page} de {page.totalPages}
      </p>

      {page.total === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
          Nadie coincide con esa búsqueda.
        </p>
      ) : (
        <div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="hidden grid-cols-[1.5fr_1.2fr_0.85fr_0.55fr_1.1fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 xl:grid">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {page.visible.map((user) => {
                const isSelf = String(user.id) === String(currentUserId);
                return (
                  <li
                    key={user.id}
                    className="grid grid-cols-1 gap-2 px-4 py-3 sm:px-5 xl:grid-cols-[1.5fr_1.2fr_0.85fr_0.55fr_1.1fr] xl:items-center xl:gap-3"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 font-medium text-stone-800">
                        <span className="truncate">
                          {user.firstName} {user.lastName}
                        </span>
                        {isSelf ? (
                          <span
                            className="inline-flex items-center gap-0.5 rounded-full bg-stone-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-stone-600"
                            title="Tu cuenta"
                          >
                            <HiOutlineLockClosed className="h-3.5 w-3.5" aria-hidden />
                            Tú
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-stone-500 xl:hidden">{user.email}</p>
                    </div>

                    <p className="hidden truncate text-sm text-stone-600 xl:block">{user.email}</p>

                    <div className="flex items-center gap-1.5">
                      <select
                        className={roleSelectClass}
                        value={user.role}
                        disabled={isSelf || roleBusyId === user.id}
                        onChange={(event) => handleRoleChange(user, event.target.value)}
                        aria-label={`Rol de ${user.firstName}`}
                      >
                        <option value="customer">Cliente</option>
                        <option value="employee">Empleado</option>
                        <option value="admin">Admin</option>
                      </select>
                      {isSelf ? (
                        <HiOutlineLockClosed
                          className="h-4 w-4 shrink-0 text-stone-400"
                          title="No puedes editar el rol de tu cuenta"
                          aria-hidden
                        />
                      ) : null}
                    </div>

                    <p
                      className={`text-xs font-medium ${
                        user.isActive ? "text-emerald-700" : "text-stone-500"
                      }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openProfile(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-red-700 hover:text-red-800"
                      >
                        <HiOutlineEye className="h-3.5 w-3.5" aria-hidden />
                        Ver perfil
                      </button>
                      <button
                        type="button"
                        onClick={() => setReservationsUser(user)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:border-red-700 hover:text-red-800"
                        title="Ver reservas"
                        aria-label="Ver reservas"
                      >
                        <HiOutlineCalendar className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasswordUser(user)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:border-red-700 hover:text-red-800"
                        title="Cambiar contraseña"
                        aria-label="Cambiar contraseña"
                      >
                        <HiOutlineKey className="h-4 w-4" aria-hidden />
                      </button>
                      {!isSelf ? (
                        <button
                          type="button"
                          onClick={() => setDeleteUser(user)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50"
                          title="Eliminar cuenta"
                          aria-label="Eliminar cuenta"
                        >
                          <HiOutlineTrash className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <Pagination
            page={page.page}
            totalPages={page.totalPages}
            total={page.total}
            pageSize={page.pageSize}
            onPageChange={page.setPage}
          />
        </div>
      )}

      <StaffUserProfilePopup
        user={profileUser}
        isOpen={Boolean(profileUser)}
        onClose={() => setProfileUser(null)}
        currentUserId={currentUserId}
        onSaved={() => router.refresh()}
        onOpenReservations={(user) => setReservationsUser(user)}
      />

      <StaffUserReservationsPopup
        user={reservationsUser}
        isOpen={Boolean(reservationsUser)}
        onClose={() => setReservationsUser(null)}
      />

      <StaffPasswordQuickPopup
        user={passwordUser}
        isOpen={Boolean(passwordUser)}
        onClose={() => setPasswordUser(null)}
      />

      <ConfirmPopup
        isOpen={Boolean(deleteUser)}
        title="¿Eliminar esta cuenta?"
        description="Se borrará el usuario. No se puede deshacer."
        itemName={
          deleteUser
            ? `${deleteUser.firstName} ${deleteUser.lastName}`.trim() || deleteUser.email
            : ""
        }
        itemImage={deleteUser?.photo || undefined}
        confirmLabel={deleting ? "Eliminando…" : "Eliminar cuenta"}
        onCancel={() => setDeleteUser(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function StaffPasswordQuickPopup({ user, isOpen, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  }, [isOpen, user?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) {
      return;
    }
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSaving(true);
    const result = await setStaffUserPasswordAction({ id: user.id, newPassword });
    setSaving(false);

    if (!result.ok) {
      setError(result.message || "No se pudo actualizar");
      return;
    }

    setMessage("Contraseña actualizada");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar contraseña"
      headerTone="brand"
      panelBgClass="bg-cream"
      maxWidthClass="max-w-md"
      overflowMode="none"
      panelClassName="px-4 pb-5 pt-4 sm:px-6"
      zClass="z-[90]"
    >
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-stone-600">
            {user.firstName} {user.lastName} · {user.email}
          </p>
          <label className="block text-sm font-medium text-stone-700">
            Nueva contraseña
            <input
              type="password"
              className={passwordInputClass}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Confirmar
            <input
              type="password"
              className={passwordInputClass}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <div className="flex justify-end gap-2 border-t border-stone-300/70 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-cream px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-white"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-red-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-900 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Actualizar"}
            </button>
          </div>
        </form>
      ) : null}
    </Popup>
  );
}
