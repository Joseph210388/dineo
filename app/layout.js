import { headers } from "next/headers";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar/navbar";
import Footer from "../components/footer/footer";
import { AuthProvider } from "../components/auth-provider";
import { AuthModalProvider } from "../components/auth-modal/auth-modal-provider";
import { isInternalStaffPath } from "../backend/session-token";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Taipei",
  description: "Restaurante de comida peruana",
};

export default async function RootLayout({ children }) {
  const pathname = (await headers()).get("x-pathname") || "";
  const isStaffArea = isInternalStaffPath(pathname);

  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${playfair.className} antialiased`}>
        <AuthProvider>
          {isStaffArea ? (
            children
          ) : (
            <AuthModalProvider>
              <Navbar />
              {children}
              <Footer />
            </AuthModalProvider>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
