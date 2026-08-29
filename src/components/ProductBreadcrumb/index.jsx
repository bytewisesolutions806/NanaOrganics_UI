'use client';

import { BreadCrumb } from 'primereact/breadcrumb';
import Link from 'next/link';
import './index.css';

export default function ShopBreadcrumb({
  category,
  categoryName,
  subcategory,
  subcategoryName,
  productName,
}) {
  const normalize = (value) =>
    String(value || '')
      .trim()
      .toLowerCase();

  const home = {
    icon: 'pi pi-home home-icon-lg',
    url: '/',
    template: () => (
      <Link href="/" aria-label="Home" className="inline-flex items-center">
        <i className="pi pi-home home-icon-lg" aria-hidden="true" />
      </Link>
    ),
  };

  const model = [];
  const hasDistinctSubcategory =
    subcategory &&
    subcategoryName &&
    normalize(subcategory) !== normalize(category) &&
    normalize(subcategoryName) !== normalize(categoryName);

  if (category && categoryName) {
    model.push({
      label: categoryName,
      template: () => (
        <Link href={`/shop/${category}`} className="transition-colors hover:text-[#2C665E]">
          {categoryName}
        </Link>
      ),
    });
  }

  if (hasDistinctSubcategory) {
    model.push({
      label: subcategoryName,
      ...(productName
        ? {
            template: () => (
              <Link
                href={`/shop/${category}/${subcategory}`}
                className="transition-colors hover:text-[#2C665E]"
              >
                {subcategoryName}
              </Link>
            ),
          }
        : {}),
    });
  }

  if (productName) {
    model.push({
      label: productName,
    });
  }

  return <BreadCrumb home={home} model={model} />;
}
