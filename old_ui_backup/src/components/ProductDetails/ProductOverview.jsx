export default function ProductOverview({
  productData,
  selectedVariant,
  isVariantInStock,
  wishlist,
}) {
  const dietType = productData?.specifications?.diet_type;
  const isVegetarian = Boolean(productData?.specifications?.is_vegetarian);
  const isOrganic = Boolean(productData?.specifications?.is_organic);

  return (
    <div className="text-[#21252C]">
      <div className="flex items-start gap-3">
        <div className="flex min-h-11 flex-wrap items-center gap-2">
          {isVegetarian ? (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-[#159A36]">
                <span className="h-3 w-3 rounded-full bg-[#159A36]" />
              </span>
              <span className="text-sm">
                This is a <strong>{dietType || 'Vegetarian'}</strong> product
              </span>
            </>
          ) : null}

          {isOrganic ? (
            <span className="rounded-full bg-[#E6F4F2] px-3 py-1 text-xs font-semibold text-[#2C665E]">
              Organic
            </span>
          ) : null}

        </div>

        <div className="relative ml-auto flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={wishlist.toggle}
            disabled={wishlist.busy}
            aria-label={wishlist.inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlist.inWishlist}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F2] transition-colors hover:bg-[#D8ECE8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {wishlist.checking ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1EA766] border-t-transparent" />
            ) : (
              <span className={`pi text-[20px] font-bold leading-none text-[#1EA766] ${wishlist.inWishlist ? 'pi-heart-fill' : 'pi-heart'}`} />
            )}
          </button>
          {wishlist.error ? <span className="max-w-[220px] text-right text-xs text-red-600">{wishlist.error}</span> : null}
        </div>
      </div>

      <h1
        className="mt-4 text-[32px] font-bold leading-[1.3] text-[#21252C] md:text-[38px]"
        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
      >
        {productData.title}
        {selectedVariant?.title ? <span className="font-semibold"> – {selectedVariant.title}</span> : null}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`h-1.5 w-1.5 rounded-full ${isVariantInStock ? 'bg-[#1EA766]' : 'bg-[#C84747]'}`} />
        <span className="text-sm font-semibold">{isVariantInStock ? 'In Stock' : 'Out of Stock'}</span>
        <span className={`rounded-lg border bg-white px-2 py-1 text-[13px] ${isVariantInStock ? 'border-[#EEDADA] text-[#C84747]' : 'border-red-200 text-red-600'}`}>
          {isVariantInStock ? 'Hurry - Stock is running out fast' : 'Currently unavailable'}
        </span>
      </div>

      {productData.tags?.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {productData.tags.slice(0, 4).map((tag, index) => {
            const label = typeof tag === 'string' ? tag : tag.value || tag.name;
            return (
              <span key={`${label}-${index}`} className="rounded-lg border border-[#C6D8D7] bg-white px-3 py-1 text-sm text-[#21252C]">
                {label}
              </span>
            );
          })}
        </div>
      ) : null}

    </div>
  );
}
