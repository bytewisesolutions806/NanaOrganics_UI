export default function HomeLoadError({ message, onRetry }) {
  return (
    <section className="site-shell py-12 text-center" role="alert">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#F0D7D2] bg-[#FFF8F6] px-6 py-8">
        <h2 className="text-2xl font-semibold text-[#233E32]">We could not load this storefront</h2>
        <p className="mt-3 text-sm leading-6 text-[#6C5B56]">
          {message || 'Please check your connection and try again.'}
        </p>
        <button
          type="button"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#315F48] px-6 text-sm font-semibold text-white transition hover:bg-[#234B37]"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
    </section>
  );
}
