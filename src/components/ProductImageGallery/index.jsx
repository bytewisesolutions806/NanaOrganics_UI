'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import './index.css';

export default function ProductImageGallery({ thumbnail, images = [], productName }) {
  const galleryImages = useMemo(() => {
    const candidates = [
      thumbnail ? { src: thumbnail, alt: productName || 'Product image' } : null,
      ...images.map((image) => ({
        src: image?.url,
        alt: image?.alt || productName || 'Product image',
      })),
    ].filter((image) => image?.src);

    return candidates.filter(
      (image, index) => candidates.findIndex((candidate) => candidate.src === image.src) === index,
    );
  }, [images, productName, thumbnail]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = galleryImages[selectedIndex] || galleryImages[0];

  if (!activeImage) return null;

  return (
    <section className="product-gallery" aria-label={`${productName || 'Product'} image gallery`}>
      <div className="product-gallery__hero">
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          priority
          sizes="(min-width: 1400px) 660px, (min-width: 768px) 70vw, calc(100vw - 40px)"
          className="object-cover"
        />
      </div>

      {galleryImages.length > 1 ? (
        <div className="product-gallery__grid" role="list" aria-label="Choose a product image">
          {galleryImages.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              role="listitem"
              aria-label={`View product image ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : undefined}
              onClick={() => setSelectedIndex(index)}
              className="product-gallery__thumbnail"
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(min-width: 1400px) 204px, (min-width: 640px) 30vw, 44vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
