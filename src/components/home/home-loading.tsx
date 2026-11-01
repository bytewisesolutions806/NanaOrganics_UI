export function HomeLoading() {
  return (
    <div
      className="relative min-h-[620px] animate-pulse bg-[#dce7dc]"
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 top-0 h-[180px] bg-white/75" />
    </div>
  );
}
