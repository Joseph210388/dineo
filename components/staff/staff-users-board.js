"use client";

import { useMemo, useState } from "react";
import StaffLink from "./staff-link";
import SearchInput from "../search-input/search-input";
import ShowMoreButton from "../show-more-button/show-more-button";
import { RoleBadge } from "./status-badge";
import { formatDate } from "../../backend/staff-format";
import { matchesSearch, TABLE_PAGE_SIZE } from "../../lib/search-text";
import { usePagedList } from "../../lib/use-paged-list";

export default function StaffUsersBoard({ users }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return users.filter((user) =>
      matchesSearch(`${user.firstName} ${user.lastName} ${user.email} ${user.role}`, query)
    );
  }, [query, users]);

  const page = usePagedList(filtered, TABLE_PAGE_SIZE);

  return (
    <div>
      <div className="mt-6 max-w-xl">
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Buscar usuario"
          placeholder="Nombre, correo o rol"
        />
      </div>
      <p className="mt-3 text-sm text-stone-500">
        {page.total} coinciden · se ven {page.visible.length}
      </p>

      {page.total === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
          Nadie coincide con esa búsqueda.
        </p>
      ) : (
        <div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.6fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 lg:grid">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Estado</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {page.visible.map((user) => (
                <li key={user.id}>
                  <StaffLink
                    href={`/staff/users/${user.id}`}
                    className="grid grid-cols-1 gap-1 px-4 py-3 transition hover:bg-stone-50 sm:px-5 lg:grid-cols-[1.4fr_1fr_0.7fr_0.6fr] lg:items-center lg:gap-3"
                  >
                    <div>
                      <p className="font-medium text-stone-800">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-stone-500 lg:hidden">{user.email}</p>
                    </div>
                    <p className="hidden truncate text-sm text-stone-600 lg:block">{user.email}</p>
                    <RoleBadge role={user.role} />
                    <p className={`text-xs font-medium ${user.isActive ? "text-emerald-700" : "text-stone-500"}`}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </p>
                    <p className="text-xs text-stone-400 lg:hidden">Alta {formatDate(user.createdAt)}</p>
                  </StaffLink>
                </li>
              ))}
            </ul>
          </div>
          <ShowMoreButton remaining={page.remaining} onClick={page.showMore} />
        </div>
      )}
    </div>
  );
}
