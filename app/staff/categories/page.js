import { redirect } from "next/navigation";

export default function StaffCategoriesPage() {
  redirect("/staff/settings?catalog=categories");
}
