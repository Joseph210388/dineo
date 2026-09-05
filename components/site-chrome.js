"use client";

import { usePathname } from "next/navigation";
import { isInternalStaffPath } from "../lib/staff-paths";
import Navbar from "./navbar/navbar";
import Footer from "./footer/footer";
import { AuthModalProvider } from "./auth-modal/auth-modal-provider";

export default function SiteChrome({ children }) {
  const pathname = usePathname() || "";

  // El panel y el login interno no deben montar navbar/footer públicos
  if (isInternalStaffPath(pathname)) {
    return children;
  }

  return (
    <AuthModalProvider>
      <div className="flex min-h-svh flex-1 flex-col bg-stone-800">
        <Navbar />
        <div className="flex flex-1 flex-col bg-cream">{children}</div>
        <Footer />
      </div>
    </AuthModalProvider>
  );
}
