import { notFound, redirect } from "next/navigation";
import ProductClient from "./ProductClient";
import { getCachedProduct, getCachedRelatedProducts } from "@/lib/publicCatalogData";

export const revalidate = 300;

export default async function ProductDetailPage({ params }) {
  const { category, subcategory, product: productSlug } = await params;

  let response;
  try {
    response = await getCachedProduct(productSlug);
  } catch {
    notFound();
  }

  if (!response?.success || !response?.data) {
    notFound();
  }

  const productData = response.data.product;
  const shopPath = productData.shop_path;
  const shopCategories = productData.shop_categories;

  // API tells us the real parent/child handles (fixes 404 when URL guesses wrong
  // or when parent category was not included in product.categories).
  if (!shopPath?.category || !shopPath?.subcategory) {
    notFound();
  }

  if (
    shopPath.category !== category ||
    shopPath.subcategory !== subcategory
  ) {
    redirect(
      `/shop/${shopPath.category}/${shopPath.subcategory}/${productSlug}`
    );
  }

  const categoryForClient = shopCategories?.parent;
  if (!categoryForClient?.handle) {
    notFound();
  }

  let relatedProducts = [];
  try {
    relatedProducts = await getCachedRelatedProducts(
      shopPath.subcategory,
      productSlug,
      6,
    );
  } catch (error) {
    console.error("Could not load related products", error);
  }

  return (
    <ProductClient
      category={categoryForClient}
      subcategory={shopPath.subcategory}
      subcategoryName={shopCategories?.child?.name ?? shopPath.subcategory}
      productData={productData}
      relatedProducts={relatedProducts}
    />
  );
}
