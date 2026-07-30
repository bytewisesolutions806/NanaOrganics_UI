'use client';

export default function OrderTimeline({ order }) {
  const timelineMap = {
    delivered: [
      { label: `Order Confirmed, ${order.confirmedDate}`, completed: true },
      { label: `Delivered on ${order.deliveredDate}`, completed: true },
    ],

    cancelled: [
      { label: `Order Confirmed, ${order.confirmedDate}`, completed: true },
      { label: `Cancelled on ${order.cancelDate}`, completed: true, color: 'red' },
    ],

    returned: [
      { label: `Order Confirmed, ${order.confirmedDate}`, completed: true },
      { label: `Delivered on ${order.deliveredDate}`, completed: true },
      { label: `Returned on ${order.returnDate}`, completed: true, color: 'orange' },
    ],

    on_the_way: [
      { label: `Order Confirmed, ${order.confirmedDate}`, completed: true },
      { label: `Shipped on ${order.shippedDate}`, completed: true },
      { label: `Out for Delivery`, completed: false },
    ],
  };

  const steps = timelineMap[order.status] || [];

  return (
    <div className="space-y-6 mt-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          {/* Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center
              ${
                step.color === 'red'
                  ? 'border-red-500 text-red-500'
                  : step.color === 'orange'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-green-600 text-green-600'
              }
              `}
            >
              ✓
            </div>

            {index !== steps.length - 1 && <div className="w-[2px] h-8 bg-green-600 mt-1"></div>}
          </div>

          {/* Text */}
          <p className="text-sm text-gray-700">{step.label}</p>
        </div>
      ))}
    </div>
  );
}
