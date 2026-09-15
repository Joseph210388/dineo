import { redirect } from "next/navigation";

export default function StaffIngredientsPage() {
  redirect("/staff/settings?catalog=ingredients");
}
