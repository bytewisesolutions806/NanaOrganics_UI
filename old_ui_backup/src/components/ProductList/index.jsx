"use client";
import { products } from "@/service/ProductCardService";
import ProductCard from "../ProductCard";

export default function ProductList() {
  return (
    <div className="flex justify-center flex-wrap">
      {products.slice(0, 3).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
