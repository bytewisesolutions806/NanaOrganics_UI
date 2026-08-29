import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TopBanner from '../../components/TopBanner';
import '../../assets/styles/globals.css';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBanner />
      <Header />
      <main className="flex-1 pt-[180px]">{children}</main>

      <Footer />
    </div>
  );
}
