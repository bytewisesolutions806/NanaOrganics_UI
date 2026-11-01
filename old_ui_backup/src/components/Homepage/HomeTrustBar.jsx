import { Leaf, PackageCheck, ShieldCheck, Truck } from 'lucide-react';

const assurances = [
  { icon: Leaf, label: 'Naturally made' },
  { icon: PackageCheck, label: 'Carefully sourced' },
  { icon: Truck, label: 'Free shipping above ₹999' },
  { icon: ShieldCheck, label: 'Secure checkout' },
];

export default function HomeTrustBar() {
  return (
    <section
      className="border-b border-[#E6ECE7] bg-[#F7F9F4]"
      aria-label="Nana Organics shopping benefits"
    >
      <div className="site-shell grid grid-cols-2 gap-x-4 gap-y-5 py-5 sm:grid-cols-4 sm:gap-4 sm:py-6">
        {assurances.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-2.5 text-center text-xs font-medium text-[#315447] sm:gap-3 sm:text-sm"
          >
            <Icon className="h-5 w-5 shrink-0 text-[#4C8B66] sm:h-6 sm:w-6" aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
