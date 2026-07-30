import { Card } from 'primereact/card';
import { HandCoins, Leaf, Star, Users } from 'lucide-react';

function StatCard({ Icon, value, label }) {
  return (
    <Card className="flex h-[200px] items-center justify-center border border-[#3C5750]/30 bg-white/50 text-center sm:h-[248px]">
      <div className="flex flex-col items-center">
        <Icon className="mb-2 h-10 w-10 text-[#2C665E] sm:mb-3 sm:h-12 sm:w-12" />
        <p className="text-xl font-bold sm:text-2xl">{value}</p>
        <p className="text-xs text-gray-600 sm:text-sm">{label}</p>
      </div>
    </Card>
  );
}

export default function ProductTrustStats({ averageRating, totalReviews }) {
  return (
    <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-6 px-4 md:px-8 lg:grid-cols-4 lg:px-16">
      <StatCard Icon={Star} value={totalReviews > 0 ? `${averageRating.toFixed(1)}/5` : '—'} label="Average Rating" />
      <StatCard Icon={Users} value={totalReviews > 0 ? `${totalReviews}` : '0'} label="Customer Reviews" />
      <StatCard Icon={Leaf} value="100%" label="Organic Certified" />
      <StatCard Icon={HandCoins} value="20K+" label="Happy Customers" />
    </div>
  );
}
