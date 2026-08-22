export default function ProductDescription({ sections = [] }) {
  if (!sections.length) return null;

  return (
    <section id="about-this-item" className="mt-8 scroll-mt-52 text-[#21252C]">
      <h2 className="mb-3 text-base font-bold">About this item</h2>
      <ul className="list-disc space-y-3 pl-5 marker:text-[#1EA766]">
        {sections.map((item, index) => (
          <li key={`${item.title}-${index}`} className="pl-1 text-sm leading-[1.58] text-[#545860]">
            {item.title ? (
              <strong className="mr-1 text-[#21252C]">{item.title} –</strong>
            ) : null}
            {item.description}
          </li>
        ))}
      </ul>
      <hr className="mt-7 border-[#3C5750]/25" />
    </section>
  );
}
