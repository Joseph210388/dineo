import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/navbar/navbar";
import Footer from "../components/footer/footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Tay Pay",
  description: "Restaurante de comida peruana",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es" className="scroll-smooth">
        <body className={`${playfair.className} antialiased`}>
          <Navbar/>
          {children}
          <Footer/>
        </body>
      </html>
    </ClerkProvider>
  );
}
