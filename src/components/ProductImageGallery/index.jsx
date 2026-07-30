"use client";

import { Galleria } from "primereact/galleria";
import Image from "next/image";
import "./index.css";

export default function ProductImageGallery({
  thumbnail,
  images = [],
  productName,
}) {
  if (!thumbnail && images.length === 0) return null;

  // ✅ Normalize images
  const galleryImages = [
    ...(thumbnail
      ? [
          {
            src: thumbnail,
            alt: productName || "Product image",
          },
        ]
      : []),

    ...images.map((img) => ({
      src: img.url,
      alt: img.alt || productName || "Product image",
    })),
  ];

  const itemTemplate = (item) => (
    <div className="gallery-main-image relative rounded-xl h-[430px]">
      <Image
        src={item.src}
        alt={item.alt}
        fill
        className="object-contain rounded-xl"
        priority
      />
    </div>
  );

  const thumbnailTemplate = (item) => (
    <div className="gallery-thumb-image relative h-[80px] w-[80px] rounded-xl">
      <Image
        src={item.src}
        alt={item.alt}
        fill
        className="object-cover rounded-xl"
      />
    </div>
  );

  return (
    <Galleria
      value={galleryImages}
      numVisible={5}
      item={itemTemplate}
      thumbnail={thumbnailTemplate}
      showThumbnails
      circular
      className="product-gallery rounded-xl"
    />
  );
}
