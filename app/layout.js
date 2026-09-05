import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/auth-provider";
import SiteChrome from "../components/site-chrome";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Taipei",
  description: "Restaurante de comida peruana",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${playfair.className} antialiased`}>
        <AuthProvider>
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
