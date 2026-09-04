import { reservationStatusLabel, userRoleLabel } from "../../backend/staff-format";

const reservationClasses = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-stone-200 text-stone-600",
  completed: "bg-sky-100 text-sky-800",
};

export function ReservationBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        reservationClasses[status] || "bg-stone-100 text-stone-700"
      }`}
    >
      {reservationStatusLabel(status)}
    </span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
      {userRoleLabel(role)}
    </span>
  );
}
