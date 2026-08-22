import { notFound } from "next/navigation";
import Breadcrumb from "@/components/ui/BreadCrumb";
import ExploreOrganicOfferings from "@/components/BannerOrganic";
import ProductSlider from "@/components/ProductSlider";
import NaturePromoBanner from "@/components/ShopDiscovery/NaturePromoBanner";
import ShopCategoryCarousel from "@/components/ShopDiscovery/ShopCategoryCarousel";
import { getCollectionBySlug } from "@/graphql/queries/collections";
import { getHomeData } from "@/service/HomeService";
import { getProductsBySubcategory } from "@/service/ProductService";

export const dynamic = "force-dynamic";

function isRootBreadcrumb(item) {
  return item.slug === "__root_collection__" || item.name === "__root_collection__";
}

function plainText(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function findSection(collections, ...handles) {
  return handles
    .map((handle) => collections.find((collection) => collection.handle === handle))
    .find((collection) => collection?.products?.length > 0);
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categoryData = await getCollectionBySlug(category);

  if (!categoryData) notFound();

  const [productResult, discoveryResult] = await Promise.allSettled([
    getProductsBySubcategory({
      subcategoryHandle: categoryData.slug,
      page: 1,
      limit: 12,
    }),
    getHomeData(),
  ]);

  const hierarchy = (categoryData.breadcrumbs || []).filter(
    (item) => !isRootBreadcrumb(item)
  );
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...hierarchy.map((item, index) => ({
      label: item.name,
      href: index < hierarchy.length - 1 ? `/shop/${item.slug}` : undefined,
    })),
  ];

  const subcategories = categoryData.children || [];
  const categoryProducts =
    productResult.status === "fulfilled" && productResult.value?.success
      ? productResult.value.data?.products || []
      : [];
  const collections =
    discoveryResult.status === "fulfilled"
      ? discoveryResult.value?.data?.collections || []
      : [];
  const bestDeals = findSection(collections, "deals", "trending", "featured");
  const relatedProducts =
    categoryProducts.length > 0
      ? categoryProducts
      : findSection(collections, "trending", "featured", "new-arrivals")?.products || [];
  const recommended = findSection(
    collections,
    "recommended",
    "best-sellers",
    "featured",
  );
  const description =
    plainText(categoryData.description) ||
    `Explore our curated range of ${categoryData.name.toLowerCase()} categories.`;

  return (
    <main className="pb-20 pt-10 md:pt-5">
      <div className="mx-auto mb-8 w-[calc(100%_-_32px)] max-w-[1296px] md:mb-10 md:w-[calc(100%_-_40px)]">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <ShopCategoryCarousel
        categories={subcategories}
        title={categoryData.name}
        description={description}
        basePath={`/shop/${categoryData.slug}`}
      />

      <div className="mt-12 md:mt-16 lg:mt-20">
        <NaturePromoBanner variant="nature" />
      </div>

      <ProductSlider
        title="Best Deal"
        subtitle="Our most loved products this season."
        products={bestDeals?.products || relatedProducts}
        browseLink="/deals"
        sectionClass="w-full py-12 md:py-16 lg:py-20"
        designVariant="figma"
      />

      <NaturePromoBanner variant="spices" />

      <ProductSlider
        title="Related Products"
        subtitle={`More products from ${categoryData.name}.`}
        products={relatedProducts}
        browseLink={`/shop/${categoryData.slug}`}
        sectionClass="w-full py-12 md:py-16 lg:py-20"
        designVariant="figma"
      />

      <ProductSlider
        title="Recommended for You"
        subtitle="Customer favourites and hand-picked recommendations."
        products={recommended?.products || relatedProducts}
        browseLink="/shop"
        sectionClass="w-full pb-12 md:pb-16 lg:pb-20"
        designVariant="figma"
      />

      <ExploreOrganicOfferings />
    </main>
  );
}
