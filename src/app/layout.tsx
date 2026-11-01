import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { DevViewportIndicator } from "@/components/layout/dev-viewport-indicator";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Nana Organics",
    template: "%s | Nana Organics",
  },
  description: "Thoughtful organic essentials for everyday living.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-clip">
        {children}
        {process.env.NODE_ENV === "development" ? <DevViewportIndicator /> : null}
      </body>
    </html>
  );
}
