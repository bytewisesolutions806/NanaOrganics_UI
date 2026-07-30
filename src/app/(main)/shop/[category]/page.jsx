import Link from "next/link";
import { notFound } from "next/navigation";
import { Leaf } from "lucide-react";
import Breadcrumb from "@/components/ui/BreadCrumb";
import SubCategorySection from "@/components/subCategory";
import HomeNatureBanner from "@/components/HomeNatureBanner";
import Trending from "@/components/Trending";
import ExploreOrganicOfferings from "@/components/BannerOrganic";
import { getCollectionBySlug } from "@/graphql/queries/collections";

function isRootBreadcrumb(item) {
  return item.slug === "__root_collection__" || item.name === "__root_collection__";
}

function plainText(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categoryData = await getCollectionBySlug(category);

  if (!categoryData) notFound();

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

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16 py-10">
      <Breadcrumb items={breadcrumbItems} />

      {subcategories.length > 0 ? (
        <SubCategorySection
          categoryHandle={categoryData.slug}
          categoryName={categoryData.name}
          categoryDescription={plainText(categoryData.description)}
          subcategories={subcategories}
        />
      ) : (
        <div
          className="my-8 md:my-10 mb-10 md:mb-12 flex justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-xl rounded-2xl border border-[#CFE3DF] bg-[#F4FAF8] px-6 py-10 md:py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6EFEF] text-[#2C665E]">
              <Leaf className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-[#21252C]">
              No subcategories found
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
              This collection does not have any child collections yet.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-[#2C665E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24554e]"
              >
                Browse shop
              </Link>
            </div>
          </div>
        </div>
      )}

      <section>
        <HomeNatureBanner />
      </section>
      <section>
        <Trending />
      </section>
      <section className="mt-10">
        <ExploreOrganicOfferings />
      </section>
    </div>
  );
}
