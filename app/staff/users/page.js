import { redirect } from "next/navigation";
import { listStaffUsers } from "../../../backend/actions/staff";
import StaffUsersBoard from "../../../components/staff/staff-users-board";

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

      {users.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          Todavía no hay usuarios.
        </p>
      ) : (
        <StaffUsersBoard users={users} />
      )}
    </main>
  );
}
