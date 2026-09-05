import { redirect } from "next/navigation";
import { requireStaff } from "../../backend/auth";
import StaffShell from "../../components/staff/staff-shell";

export const dynamic = "force-dynamic";
export const preferredRegion = "dub1";

export const metadata = {
  title: "Panel | Taipei",
  robots: { index: false, follow: false },
};

export default async function StaffLayout({ children }) {
  let user;

  try {
    user = await requireStaff();
  } catch {
    redirect("/acceso-personal");
  }

  return <StaffShell user={user}>{children}</StaffShell>;
}
