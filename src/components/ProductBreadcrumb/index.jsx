"use client";

import { BreadCrumb } from "primereact/breadcrumb";
import Link from "next/link";
import "./index.css";

export default function ShopBreadcrumb({
  category,
  categoryName,
  subcategory,
  subcategoryName,
  productName,
}) {
  const home = {
    icon: "pi pi-home home-icon-lg",
    url: "/",
  };

  const model = [];

  // ✅ ONLY add category when it exists
  if (category && categoryName) {
    model.push({
      label: categoryName,
      // template: () => <Link href={`/shop/${category}`}>{categoryName}</Link>,
    });
  }

  // ✅ ONLY add subcategory when it exists
  if (subcategory && subcategoryName) {
    model.push({
      label: subcategoryName,
      // template: () => (
      //   <Link href={`/shop/${category}/${subcategory}`}>{subcategoryName}</Link>
      // ),
    });
  }

  // ✅ PRODUCT LEVEL (NO LINK)
  if (productName) {
    model.push({
      label: productName,
    });
  }

  return <BreadCrumb home={home} model={model} />;
}
