'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import './index.css';

const SWIPE_THRESHOLD = 50;

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const touchStartX = useRef(null);
  const activeIndex = selectedIndex < galleryImages.length ? selectedIndex : 0;
  const activeImage = galleryImages[activeIndex] || galleryImages[0];
  const hasMultipleImages = galleryImages.length > 1;

  if (!activeImage) return null;

  const selectImage = (index) => {
    setSelectedIndex(index);
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  const showPreviousImage = () => {
    selectImage((activeIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const showNextImage = () => {
    selectImage((activeIndex + 1) % galleryImages.length);
  };

  const handleMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setZoomPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const handleKeyDown = (event) => {
    if (!hasMultipleImages) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPreviousImage();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextImage();
    }
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (!hasMultipleImages || touchStartX.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    if (typeof touchEndX !== 'number') return;

    const distance = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    if (distance > 0) showPreviousImage();
    else showNextImage();
  };

  return (
    <section
      className="product-gallery"
      aria-roledescription="carousel"
      aria-label={`${productName || 'Product'} image gallery`}
    >
      <div
        className="product-gallery__stage"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={hasMultipleImages ? 'Product image carousel. Use left and right arrow keys to navigate.' : undefined}
      >
        <div
          className="product-gallery__viewport"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setIsZoomed(false);
            setZoomPosition({ x: 50, y: 50 });
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            priority
            sizes="(min-width: 1400px) 660px, (min-width: 768px) 70vw, calc(100vw - 40px)"
            className="product-gallery__image"
            data-zoomed={isZoomed ? 'true' : 'false'}
            style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
          />

          <span className="product-gallery__zoom-hint" aria-hidden="true">
            <Search size={16} strokeWidth={2} />
            Hover to zoom
          </span>
        </div>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="product-gallery__arrow product-gallery__arrow--previous"
              aria-label="View previous product image"
            >
              <ChevronLeft size={25} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="product-gallery__arrow product-gallery__arrow--next"
              aria-label="View next product image"
            >
              <ChevronRight size={25} strokeWidth={2} />
            </button>
            <span className="product-gallery__counter" aria-live="polite">
              {activeIndex + 1} / {galleryImages.length}
            </span>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="product-gallery__thumbnails" role="tablist" aria-label="Choose a product image">
          {galleryImages.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              role="tab"
              aria-label={`View product image ${index + 1}`}
              aria-selected={index === activeIndex}
              onClick={() => selectImage(index)}
              className="product-gallery__thumbnail"
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="112px"
                className="product-gallery__thumbnail-image"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
