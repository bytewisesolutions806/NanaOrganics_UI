import { notFound, redirect } from 'next/navigation';
import ShopBreadcrumb from '@/components/ProductBreadcrumb';
import Filters from '@/components/Filters';
import ProductGrid from '@/components/ProductGrid';
import { getProductsBySubcategory } from '@/service/ProductService';
import { ArrowDownWideNarrow } from 'lucide-react';
import MobileFilterTrigger from '@/components/MobileFilterTrigger';
import CategoryFilter from '@/components/Filters/CategoryFilter';
import CategoryList from '@/components/CategoryList';
import MobileCategoryFilter from '@/components/MobilecategoryDrawer';

/**
 * /shop/[category]/[subcategory]
 * Example: /shop/home-essentials/organic-foods
 */
export default async function SubCategoryPage({ params, searchParams }) {
  // ✅ Next.js 16+ dynamic params must be awaited
  const { category, subcategory } = await params;
  const query = await searchParams;
  const requestedPage = Number.parseInt(query?.page || '1', 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const facetFilters = Object.entries(query || {})
    .filter(([key]) => key.startsWith('f_'))
    .map(([, value]) => (Array.isArray(value) ? value : [value]))
    .flatMap((values) => values.map((value) => String(value).split(',')))
    .map((values) => values.filter(Boolean));

  // ✅ Call backend API using subcategory handle
  const response = await getProductsBySubcategory({
    subcategoryHandle: subcategory,
    page,
    limit: 20,
    facetFilters,
    sort: query?.sort || 'name_asc',
  });

  // ❌ Invalid subcategory
  if (!response?.success) notFound();

  const {
    subcategory: subcategoryData,
    products,
    pagination,
    filters,
    sort_options,
    sbc,
  } = response.data;
  // ✅ URL safety: category in URL must match API parent category
  if (subcategoryData.parent_category.handle !== category) {
    redirect(`/shop/${subcategoryData.parent_category.handle}/${subcategory}`);
  }

  if (page > pagination.total_pages && pagination.total > 0) {
    redirect(`/shop/${category}/${subcategory}?page=${pagination.total_pages}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16 py-10">
      {/* ================= BREADCRUMB ================= */}
      <ShopBreadcrumb
        category={subcategoryData.parent_category.handle}
        categoryName={subcategoryData.parent_category.name}
        subcategory={subcategory}
        subcategoryName={subcategoryData.name}
      />

      {/* ================= PAGE TITLE ================= */}
      <div className="flex items-center gap-3 mb-2 mt-7">
        <h1 className="text-3xl font-semibold">{subcategoryData.name}</h1>

        {/* Mobile Filter Button */}
        <MobileCategoryFilter availableFilters={filters.facets} />
      </div>

      {subcategoryData.description && (
        <p className="text-gray-600 mb-6">{subcategoryData.description}</p>
      )}

      {/* ================= MAIN GRID ================= */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* LEFT FILTERS (Desktop only) */}
        <div className="hidden lg:block">
          <CategoryList availableFilters={filters.facets} />
        </div>

        {/* RIGHT PRODUCTS */}
        <ProductGrid
          category={subcategoryData}
          products={products}
          pagination={pagination}
          sortOptions={sort_options}
        />
      </div>
    </div>
  );
}
