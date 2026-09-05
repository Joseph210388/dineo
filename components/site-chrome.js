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
      <Navbar />
      {children}
      <Footer />
    </AuthModalProvider>
  );
}
