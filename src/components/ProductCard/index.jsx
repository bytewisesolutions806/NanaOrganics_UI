import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <div
      className="
        w-full max-w-[390px]
        bg-white
        rounded-2xl
        m-3
        flex
        gap-5
        items-start
        border
        border-[#E6F4F2]
      "
    >
      {/* IMAGE */}
      <Image
        src={product.image}
        alt={product.title}
        width={140}
        height={140}
        className="
    w-[100px] h-[140px]          /* XS + SM */
    sm:w-[120px]     /* SM */
    md:w-[140px]   /* MD, LG, XL */
    object-cover
    rounded-3xl
    p-2
  "
      />

      {/* CONTENT */}
      <div className="flex flex-col justify-between flex-1">
        {/* PRICE ROW */}
        <div className=" mt-3 flex items-center gap-2">
          <h3 className="flex items-end gap-1">
            <span className="text-sm relative -top-1">$</span>
            <span className="text-[20px] font-semibold">
              {product.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </h3>

          <span className="line-through text-gray-400 text-sm pl-3">
            <span className="text-sm relative">$</span>
            <span className="">
              {product.oldPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
          <span className="bg-[#D6F5E1] text-[#008144] text-xs px-3 py-1 rounded-xl ml-auto mr-2 font-semibold">
            {product.discount}
          </span>
        </div>

        {/* TITLE */}
        <p className="text-sm text-gray-600 mt-2 font-semibold leading-relaxed">
          {product.title}
        </p>

        {/* BUTTON */}
        <div className="mt-4">
          <button className="bg-[#E6F4F2] text-[#1EA766] text-sm font-bold border-[#1EA766] px-5 py-2 rounded-xl cursor-pointer transition">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}
