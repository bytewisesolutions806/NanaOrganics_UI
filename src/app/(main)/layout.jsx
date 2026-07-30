"use client";
import { useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TopBanner from "../../components/TopBanner";
import "../../assets/styles/globals.css";

export default function MainLayout({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("accessToken");
      console.log("Session Storage details", token);
      // setToken(token);
    }
  }, []);

  return (
    <>
      <TopBanner />
      <Header />
      <main className="pt-[180px]">
          {children}
        </main>

      <Footer />
    </>
  );
}
