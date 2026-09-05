import StaffLink from "../../../components/staff/staff-link";
import { redirect } from "next/navigation";
import { listStaffUsers } from "../../../backend/actions/staff";
import { formatDate } from "../../../backend/staff-format";
import { RoleBadge } from "../../../components/staff/status-badge";

export default async function StaffUsersPage() {
  let users;

  try {
    users = await listStaffUsers();
  } catch {
    redirect("/staff");
  }

  return (
    <main className="mx-auto w-full max-w-6xl">
      <h1 className="text-[clamp(1.4rem,3vw,2rem)] text-stone-900">Usuarios</h1>
      <p className="mt-1 text-sm text-stone-500">Clientes y personal. Solo administración puede editar roles.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.6fr] gap-3 border-b border-stone-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-stone-500 lg:grid">
          <span>Nombre</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Estado</span>
        </div>
        <ul className="divide-y divide-stone-100">
          {users.map((user) => (
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
    </main>
  );
}
