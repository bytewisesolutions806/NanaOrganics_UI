import { notFound, redirect } from "next/navigation";
import ProductClient from "./ProductClient";
import { getProductById } from "@/service/Product";

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

  return (
    <ProductClient
      category={categoryForClient}
      subcategory={shopPath.subcategory}
      subcategoryName={shopCategories?.child?.name ?? shopPath.subcategory}
      productData={productData}
    />
  );
}
