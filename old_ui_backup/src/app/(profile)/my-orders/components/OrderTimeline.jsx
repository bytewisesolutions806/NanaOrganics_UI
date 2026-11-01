'use client';

import { Box, PackageCheck, Truck } from 'lucide-react';

export default function OrderTimeline({ order }) {
  if (!order?.id || !order?.confirmedDate) return null;

  const status = order.status || order.uiStatus || 'confirmed';
  const shipped = Boolean(
    order.shippedDate || ['on_the_way', 'delivered', 'returned'].includes(status),
  );
  const delivered = Boolean(
    order.deliveredDate || ['delivered', 'returned'].includes(status),
  );
  const steps = [
    { title: 'Order Placed', date: order.confirmedDate, Icon: Box, completed: true },
    { title: 'Shipped', date: order.shippedDate, Icon: Truck, completed: shipped },
    { title: 'Delivered', date: order.deliveredDate, Icon: PackageCheck, completed: delivered },
  ];
  const currentStep = delivered ? 2 : shipped ? 1 : 0;

  return (
    <section className="mt-7 border-t border-[#E3ECEA] pt-6" aria-label="Order progress">
      <ol className="grid grid-cols-3">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative flex min-w-0 flex-col items-center px-1 text-center sm:px-3"
          aria-current={index === currentStep ? 'step' : undefined}
        >
          {index < steps.length - 1 ? (
            <span
              className={`absolute left-1/2 top-6 h-0.5 w-full ${steps[index + 1].completed ? 'bg-[#2C665E]' : 'bg-[#D9E5E2]'}`}
              aria-hidden="true"
            />
          ) : null}

          <span
            className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${step.completed ? 'border-[#2C665E] bg-[#2C665E] text-white' : 'border-[#B8CBC6] bg-white text-[#91A7A1]'}`}
          >
            <step.Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <strong className={`mt-3 text-xs sm:text-sm ${step.completed ? 'text-[#17211F]' : 'text-[#71817D]'}`}>
            {step.title}
          </strong>
          {step.date ? (
            <span className="mt-1 text-[11px] leading-4 text-[#68716F] sm:text-xs">
              {step.date}
            </span>
          ) : null}
        </li>
      ))}
      </ol>
    </section>
  );
}
