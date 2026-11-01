'use client';

import Image from 'next/image';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import productImage02 from '@/assets/images/products/product_image_02.png';
import ecoImage from '@/assets/images/products/purely_natural_eco.png';
import peopleFocused from '@/assets/images/people_focused.png';

export default function NaturalIngredients() {
  const router = useRouter();

  return (
    <section className=" px-4">
      {/* Heading */}
      <div className="text-center max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold">Purely Natural Ingredients</h2>
        <p className="mt-2 text-base sm:text-xl text-gray-600">
          Sustainably sourced for a healthier planet
        </p>
      </div>

      {/* MAIN GRID */}
      <div
        className="
          max-w-312 mx-auto mt-8
          grid gap-4
          grid-cols-1
          lg:grid-cols-4
        "
      >
        {/* ================= MAIN CARD ================= */}
        <Card className="lg:col-span-2 bg-[#E6F4F2] rounded-2xl shadow-none">
          <div className="flex min-h-[380px] h-full">
            {/* LEFT CONTENT */}
            <div className="w-1/2 p-4 sm:p-6 flex flex-col justify-center">
              <span className="mb-2 w-20 h-8 flex items-center justify-center rounded-xl border border-[#2C665E] text-sm font-bold text-[#2C665E] bg-white">
                Fresh
              </span>

              <h3 className="text-xl sm:text-2xl lg:text-[30px] font-bold text-gray-800">
                Crafted with Care and Passion
              </h3>

              <p className="mt-3 text-sm text-gray-600">
                Handmade products that nourish your body and soul.
              </p>

              <Button
                onClick={() => router.push('/shop')}
                className="mt-6 bg-green-600 text-white px-5 py-2 rounded-xl w-fit"
              >
                Learn More
              </Button>
            </div>

            {/* RIGHT IMAGE — FULL WIDTH & HEIGHT */}
            <div className="w-1/2 relative">
              <Image
                src={productImage02}
                alt="Product"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover rounded-tr-2xl rounded-br-2xl"
              />
            </div>
          </div>
        </Card>

        {/* ================= SMALL CARDS ================= */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {/* SMALL CARD 1 */}
          <Card className="bg-[#E6F4F2] rounded-2xl overflow-hidden">
            <div className="flex flex-col h-full min-h-[380px]">
              <div className="flex-1 p-5 flex flex-col justify-center">
                <span className="mb-2 w-20 h-6 flex items-center justify-center rounded-xl border border-[#2C665E] text-sm font-bold text-[#2C665E] bg-white">
                  Local
                </span>
                <h3 className="text-lg font-semibold text-[#2C665E]">Fresh Organic Foods</h3>
                <p className="mt-3 text-sm text-gray-600">
                  Directly sourced from trusted organic farms.
                </p>
                <Button
                  onClick={() => router.push('/shop')}
                  className="mt-4 text-[#1EA766] border border-[#1EA766] bg-white px-4 py-2 rounded-xl w-fit"
                >
                  Shop Now
                </Button>
              </div>

              <div className="h-40">
                <Image src={ecoImage} alt="Product" className="w-full h-full object-cover" />
              </div>
            </div>
          </Card>

          {/* SMALL CARD 2 */}
          <Card className="bg-[#E6F4F2] rounded-2xl overflow-hidden">
            <div className="flex flex-col h-full min-h-[380px]">
              <div className="flex-1 p-5 flex flex-col justify-center">
                <span className="mb-2 w-20 h-6 flex items-center justify-center rounded-xl border border-[#2C665E] text-sm font-bold text-[#2C665E] bg-white">
                  Local
                </span>
                <h3 className="text-lg font-semibold text-[#2C665E]">Fresh Organic Foods</h3>
                <p className="mt-3 text-sm text-gray-600">
                  Directly sourced from trusted organic farms.
                </p>
                <Button
                  onClick={() => router.push('/shop')}
                  className="mt-4 text-[#1EA766] border border-[#1EA766] bg-white px-4 py-2 rounded-xl w-fit"
                >
                  Shop Now
                </Button>
              </div>

              <div className="h-40">
                <Image src={peopleFocused} alt="Product" className="w-full h-full object-cover" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
