import dynamic from 'next/dynamic';

const ReviewCard = dynamic(() => import('@/components/ReviewCard'));

export default function HomeTestimonials({ reviews, loading }) {
  if (!reviews.length && !loading) return null;

  return (
    <section
      className="relative my-12 overflow-hidden bg-[#F1F6F0] py-10 sm:my-16 sm:py-14"
      aria-labelledby="home-testimonials-title"
    >
      <div className="site-shell relative z-10">
        <div className="mb-7 text-center sm:mb-9">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#508162] sm:text-sm">
            KIND WORDS
          </p>
          <h2
            id="home-testimonials-title"
            className="mt-2 text-3xl font-semibold leading-tight text-[#233E32] sm:text-4xl"
          >
            What our customers say
          </h2>
        </div>
        <ReviewCard reviews={reviews} loading={loading} />
      </div>
    </section>
  );
}
