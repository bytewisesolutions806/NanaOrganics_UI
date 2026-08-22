import { HandCoins, Leaf, Star, Users } from 'lucide-react';

function StatCard({ Icon, value, label }) {
  return (
    <article className="flex min-h-[196px] flex-col items-center justify-center gap-4 rounded-2xl border border-[#3C5750]/25 bg-white/50 px-6 py-10 text-center text-[#3C5750] md:min-h-[250px]">
      <Icon className="h-14 w-14" strokeWidth={1.4} />
      <div>
        <p className="text-[28px] font-bold leading-tight md:text-[32px]">{value}</p>
        <p className="mt-1 text-sm leading-6 md:text-base">{label}</p>
      </div>
    </article>
  );
}

export default function ProductTrustStats({ averageRating, totalReviews, returnWindow = 30 }) {
  return (
    <section className="mx-auto mt-14 grid w-[calc(100%_-_40px)] max-w-[1298px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard Icon={Star} value={totalReviews > 0 ? `${averageRating.toFixed(1)}/5` : 'New'} label="Average Rating" />
      <StatCard Icon={Users} value={totalReviews.toLocaleString('en-IN')} label="Customer Reviews" />
      <StatCard Icon={Leaf} value="100%" label="Natural Ingredients" />
      <StatCard Icon={HandCoins} value={`${returnWindow} Days`} label="Money-Back Guarantee" />
    </section>
  );
}
