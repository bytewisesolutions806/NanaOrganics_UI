import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TopBanner from '../../components/TopBanner';
import '../../assets/styles/globals.css';
import { getCachedCategories } from '@/lib/publicCatalogData';

export default async function MainLayout({ children }) {
  let initialCategories = [];
  try {
    initialCategories = await getCachedCategories();
  } catch (error) {
    console.error('Could not load navigation categories', error);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBanner />
      <Header initialCategories={initialCategories} />
      <main className="flex-1 pt-[180px]">{children}</main>

      <Footer />
    </div>
  );
}
