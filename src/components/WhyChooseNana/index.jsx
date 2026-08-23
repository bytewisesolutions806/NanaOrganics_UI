'use client';

import Image from 'next/image';
import choosenanaBanner from '@/assets/images/choose_nana_banner.png';
import gridicons_shipping from '@/assets/images/gridicons_shipping.png';
import LeafFilled from '@/assets/images/lsicon_leaf-filled.png';
import Regroup from '@/assets/images/ReGroup.png';
import TruckImage from '@/assets/images/TruckImage.png';

export default function WhyChooseNana() {
  return (
    <div className="relative max-w-7xl mx-auto px-4">
      <div className="relative w-full lg:h-[280px] rounded-2xl overflow-hidden">
        {/* BACKGROUND IMAGE */}
        <Image
          src="/choose_nana_banner.svg"
          alt="Why Choose Nana"
          fill
          className="object-cover"
          priority
        />

        {/* OVERLAY */}
        <div className="relative flex items-center h-full">
          <div className="w-full px-4 sm:px-8 text-white py-6 sm:py-10 lg:py-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-8 text-center">
              Why Choose NANA?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* FEATURE 1 */}
              <div className="flex flex-row lg:flex-col gap-3 lg:border-r border-white/40 lg:pr-6">
                {/* <Image src={LeafFilled} alt="" className="w-10 h-8 shrink-0" /> */}
                <img src="/lsicon_leaf-filled.svg" className="w-10 h-8 shrink-0" alt="" />
                <div>
                  <h4 className="font-semibold">100% Natural Ingredients</h4>
                  <p className="text-sm text-white/80">
                    Crafted from pure, organic sources to ensure safety and freshness.
                  </p>
                </div>
              </div>

              {/* FEATURE 2 */}
              <div className="flex flex-row lg:flex-col gap-3 lg:border-r border-white/40 lg:pr-6">
                {/* <Image src={TruckImage} alt="" className="w-10 h-8 shrink-0" /> */}
                <img src="/gridicons_shipping.svg" className="w-10 h-8 shrink-0" alt="" />
                <div>
                  <h4 className="font-semibold">Free Shipping Above ₹999</h4>
                  <p className="text-sm text-white/80">
                    Delivered safely and quickly with no extra cost.
                  </p>
                </div>
              </div>

              {/* FEATURE 3 */}
              <div className="flex flex-row lg:flex-col gap-3 lg:border-r border-white/40 lg:pr-6">
                <img src="/shipping.svg" alt="" className="w-10 h-8 shrink-0" />
                <div>
                  <h4 className="font-semibold">Secure Payments</h4>
                  <p className="text-sm text-white/80">
                    Encrypted and trusted payments at every step.
                  </p>
                </div>
              </div>

              {/* FEATURE 4 */}
              <div className="flex flex-row lg:flex-col gap-3">
                <img src="/recycle.svg" alt="" className="w-10 h-8 shrink-0" />
                <div>
                  <h4 className="font-semibold">Hassle-free Returns</h4>
                  <p className="text-sm text-white/80">Easy returns and customer-first policies.</p>
                </div>
              </div>
            </div>
            {/* END FEATURES */}
          </div>
        </div>
      </div>
    </div>
  );
}
