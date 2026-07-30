'use client';

import Image from 'next/image';

export default function OrderUpdatesModal({ order, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[999]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[1000]">
        <div className="bg-white rounded-2xl w-[90%] max-w-[420px] shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex gap-3 items-center">
              <Image
                src={order.image}
                alt={order.name}
                width={45}
                height={45}
                className="rounded-lg"
                unoptimized={
                  typeof order.image === 'string' &&
                  order.image.startsWith('http')
                }
              />

              <div>
                <p className="text-sm font-semibold">
                  {order.name}
                  {order.weight ? ` — ${order.weight}` : ''}
                </p>
                <p className="text-sm font-semibold">
                  {order.priceLabel != null
                    ? order.priceLabel
                    : `$${Number(order.price ?? 0).toFixed(2)}`}
                </p>
              </div>
            </div>

            <button onClick={onClose} className="text-gray-500 text-lg">
              ✕
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-[#EEF4F3] p-5 max-h-[400px] overflow-y-auto">
            {(order.updates || []).map((update, index) => (
              <div key={index} className="flex gap-3 mb-6">
                {/* Timeline Icon */}
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full border-2 border-green-600 flex items-center justify-center text-green-600 text-xs">
                    ✓
                  </div>

                  {index !== (order.updates || []).length - 1 && (
                    <div className="w-[2px] h-10 bg-green-600 mt-1"></div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <p className="text-sm font-medium">{update.status}</p>
                  {update.description ? (
                    <p className="text-xs text-gray-600 mt-0.5">{update.description}</p>
                  ) : null}
                  <p className="text-xs text-gray-400">{update.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
