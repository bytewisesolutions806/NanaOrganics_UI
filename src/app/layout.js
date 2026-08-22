import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/800.css";
import "@fontsource/playfair-display/900.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "primereact/resources/themes/lara-light-teal/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "../assets/styles/globals.css";

import AuthHydration from "@/components/Authhydration";
import AppToastProvider from "@/components/AppToastProvider";
import CartToastListener from "@/components/CartToastListener";

export const metadata = {
  title: "Nana Organics",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ "--font-playfair": '"Playfair Display"' }}>
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
