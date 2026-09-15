import { redirect } from "next/navigation";

export default function StaffAllergensPage() {
  redirect("/staff/settings?catalog=allergens");
}
