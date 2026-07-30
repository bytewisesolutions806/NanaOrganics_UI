import { Playfair_Display } from "next/font/google";
import "@fontsource/plus-jakarta-sans";
import "primereact/resources/themes/lara-light-teal/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "../assets/styles/globals.css";

import AuthHydration from "@/components/Authhydration";
import AppToastProvider from "@/components/AppToastProvider";
import CartToastListener from "@/components/CartToastListener";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "Nana Organics",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={playfair.variable}>
      <body>
        <AppToastProvider>
          {/* ✅ HYDRATE AUTH STORE */}
          <AuthHydration />

          {/* ✅ CART TOAST LISTENER */}
          <CartToastListener />

          {children}
        </AppToastProvider>
      </body>
    </html>
  );
}
