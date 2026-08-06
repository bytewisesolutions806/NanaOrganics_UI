import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Pagination from '@/components/Pagination';
import { getAllCollections } from '@/graphql/queries/collections';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

export const dynamic = 'force-dynamic';

const COLLECTIONS_PER_PAGE = 20;

export default async function ShopPage({ searchParams }) {
  const query = await searchParams;
  const requestedPage = Number.parseInt(query?.page || '1', 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let collections = [];
  let totalPages = 1;
  let error = '';

  try {
    const result = await getAllCollections({
      topLevelOnly: true,
      skip: (page - 1) * COLLECTIONS_PER_PAGE,
      take: COLLECTIONS_PER_PAGE,
      sort: { position: 'ASC' },
    });
    collections = result?.items || [];
    totalPages = Math.max(1, Math.ceil((result?.totalItems || 0) / COLLECTIONS_PER_PAGE));

    if (page > totalPages && (result?.totalItems || 0) > 0) {
      redirect(`/shop?page=${totalPages}`);
    }
  } catch (requestError) {
    if (requestError?.digest?.startsWith('NEXT_REDIRECT')) throw requestError;
    error = requestError?.message || 'Could not load categories.';
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 lg:px-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1EA766]">
          Browse our catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900 md:text-4xl">Shop by Category</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
          Choose a category to explore its subcategories and products.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-2xl border border-[#CFE3DF] bg-[#F4FAF8] px-6 py-12 text-center text-gray-600">
          No categories are available yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {collections.map((collection) => {
              const image = collection.featuredAsset?.preview || DEFAULT_IMAGE;
              return (
                <Link
                  key={collection.id}
                  href={`/shop/${collection.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#DDECE9] bg-[#E6F4F2] transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-white">
                    <Image
                      src={image.replace(/\\/g, '/')}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 font-semibold text-gray-900">{collection.name}</h2>
                    <p className="mt-2 text-xs text-gray-600">
                      {collection.productVariantCount} products
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </main>
  );
}
