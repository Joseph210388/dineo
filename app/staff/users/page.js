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
      {users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-10 text-center text-sm text-stone-500">
          Todavía no hay usuarios.
        </p>
      ) : (
        <StaffUsersBoard users={users} />
      )}
    </main>
  );
}
