import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TopBanner from "../../components/TopBanner";
import "../../assets/styles/globals.css";

export default function MainLayout({ children }) {
  return (
    <>
      <TopBanner />
      <Header />
      <main className="pt-[180px]">{children}</main>

      <Footer />
    </>
  );
}
