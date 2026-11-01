import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TopBanner from '../../components/TopBanner';
import '../../assets/styles/globals.css';

export default async function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBanner />
      <Header />
      <main className="flex-1 pt-[248px] md:pt-[180px] lg:pt-[220px]">{children}</main>

      <Footer />
    </div>
  );
}
