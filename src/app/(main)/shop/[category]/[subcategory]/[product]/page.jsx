import { notFound, redirect } from "next/navigation";
import ProductClient from "./ProductClient";
import { getProductById } from "@/service/Product";
import { getHomeData } from "@/service/HomeService";

export default async function ProductDetailPage({ params }) {
  const { category, subcategory, product: productSlug } = await params;

  let response;
  try {
    response = await getProductById({ productId: productSlug });
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
    const homeResponse = await getHomeData();
    const candidates = (homeResponse?.data?.collections || [])
      .flatMap((collection) => collection.products || [])
      .filter((product) => product.handle !== productSlug);
    const sameCollection = candidates.filter(
      (product) => product.subcategory?.handle === shopPath.subcategory,
    );
    const pool = sameCollection.length > 0 ? sameCollection : candidates;
    const seen = new Set();
    relatedProducts = pool
      .filter((product) => product.handle && !seen.has(product.handle) && seen.add(product.handle))
      .slice(0, 6);
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
