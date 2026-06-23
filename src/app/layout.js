import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SplashLoader from "../components/SplashLoader";

export const metadata = {
  title: "Needle Fashion | Threaded with Elegance",
  description: "Experience clean lines, structural shapes, and curated crimson tailoring designed for the modern wardrobe.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SplashLoader />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
