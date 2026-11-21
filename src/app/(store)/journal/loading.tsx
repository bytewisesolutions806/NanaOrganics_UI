export default function JournalLoading() {
  return (
    <main className="animate-pulse bg-white" aria-label="Loading Journal">
      <div className="h-[430px] bg-[#edf1eb]" />
      <div className="mx-auto grid max-w-[1040px] gap-10 px-5 py-20 md:grid-cols-2">
        <div className="aspect-[1.62/1] rounded-xl bg-[#e7ece8]" />
        <div className="space-y-4 py-4">
          <div className="h-5 w-28 rounded bg-[#dce5de]" />
          <div className="h-10 w-full rounded bg-[#e4e9e5]" />
          <div className="h-5 w-4/5 rounded bg-[#edf0ed]" />
          <div className="h-11 w-32 rounded bg-[#dce5de]" />
        </div>
      </div>
    </main>
  );
}
