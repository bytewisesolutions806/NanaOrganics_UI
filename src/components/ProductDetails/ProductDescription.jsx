export default function ProductDescription({ sections = [] }) {
  return (
    <>
      <div className="mt-8">
        <p className="mb-4 text-base font-bold">About this item</p>
        <div className="space-y-3">
          {sections.map((item, index) => (
            <p key={`${item.title}-${index}`} className="text-sm leading-relaxed text-gray-700">
              <span className="mr-1 font-semibold text-gray-900">{item.title} –</span>
              <span className="text-sm text-gray-500">{item.description}</span>
            </p>
          ))}
        </div>
      </div>
      <hr className="mt-4 text-[#3C5750]/25" />
    </>
  );
}
