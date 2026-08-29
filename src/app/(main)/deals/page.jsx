import Link from 'next/link';
import CardProduct from '@/components/CardProduct';
import { getDealsData } from '@/service/DealsService';

export const metadata = {
  title: 'Deal of the Week | Nana Organics',
  description: 'Shop all Nana Organics products selected for this week’s deals.',
};

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const deals = await getDealsData();
  const products = deals?.products || [];

  return (
    <main className="site-shell min-h-[55vh] py-8 lg:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-[#1EA766]">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-800">Deal of the Week</span>
      </nav>

      <header className="mb-8 rounded-3xl bg-[#F1F9F6] px-5 py-7 sm:px-8 lg:flex lg:items-end lg:justify-between lg:px-10">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1EA766]">
            Limited-time savings
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Deal of the Week
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            {deals?.description ||
              'Explore every organic product currently selected for our weekly deals.'}
          </p>
        </div>
        {products.length > 0 && (
          <p className="mt-5 text-sm font-medium text-gray-600 lg:mt-0">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        )}
      </header>

      {products.length > 0 ? (
        <section
          className="grid grid-cols-1 gap-y-7 sm:grid-cols-[repeat(2,minmax(0,306px))] sm:justify-center sm:gap-x-3 lg:grid-cols-[repeat(3,minmax(0,306px))] xl:grid-cols-[repeat(4,minmax(0,306px))]"
          aria-label="Deal products"
        >
          {products.map((product) => (
            <CardProduct key={product.id} item={product} />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-[#DDECE9] bg-[#F7FBFA] px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900">No weekly deals are available yet</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">
            Products added to the Deal of the Week collection will appear here automatically.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-xl bg-[#28786A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#20675B]"
          >
            Browse all products
          </Link>
        </section>
      )}
    </main>
  );
}
