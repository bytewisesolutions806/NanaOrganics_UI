export default function ProductOverview({ productData, selectedVariant, isVariantInStock, wishlist }) {
  return (
    <>
      <div className="flex">
        <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-green-600">
          <span className="h-3 w-3 rounded-full bg-[#2C665E]" />
        </div>
        {productData?.specifications?.diet_type && (
          <h1 className="ml-4">
            This is a <span className="font-bold">{productData.specifications.diet_type}</span>{' '}product
          </h1>
        )}
        {productData?.specifications?.item_form && (
          <span className="ml-auto flex h-8 w-25 items-center justify-center rounded-xl bg-[#E6F4F2] font-bold text-[#2C665E]">
            {productData.specifications.item_form}
          </span>
        )}
        <div className="relative ml-auto flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={wishlist.toggle}
            disabled={wishlist.busy}
            aria-label={wishlist.inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlist.inWishlist}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4F2] transition-colors hover:bg-[#d8ece8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {wishlist.checking ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1EA766] border-t-transparent" />
            ) : (
              <span className={`pi text-[18px] font-bold leading-none text-[#1EA766] ${wishlist.inWishlist ? 'pi-heart-fill' : 'pi-heart'}`} />
            )}
          </button>
          {wishlist.error && <span className="max-w-[200px] text-right text-xs text-red-600">{wishlist.error}</span>}
        </div>
      </div>

      <h1 className="mb-2 mt-4 text-3xl font-semibold">
        {productData.title} - <span className="font-semibold">{selectedVariant?.title} - {productData?.metadata?.quantity_type}</span>
      </h1>

      <div className="mt-6 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md">
          <span className={`h-2 w-2 rounded-full ${isVariantInStock ? 'bg-[#2C665E]' : 'bg-red-500'}`} />
        </div>
        <span className={`mr-4 font-semibold ${isVariantInStock ? 'text-[#2C665E]' : 'text-red-600'}`}>
          {isVariantInStock ? 'In Stock' : 'Out of Stock'}
        </span>
        <span className={`flex h-8 items-center justify-center whitespace-nowrap rounded-xl border bg-white px-4 font-normal ${isVariantInStock ? 'border-green-300 text-[#2C665E]' : 'border-red-300 text-[#C84747]'}`}>
          {isVariantInStock ? 'Hurry! Stock is running out fast!' : 'Currently unavailable'}
        </span>
      </div>

      {productData.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {productData.tags.map((tag, index) => (
            <span key={`${typeof tag === 'string' ? tag : tag.value || tag.name}-${index}`} className="rounded-md border border-[#C6D8D7] bg-white/50 px-3 py-1 text-sm font-normal text-[#21252C]">
              {typeof tag === 'string' ? tag : tag.value || tag.name}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
