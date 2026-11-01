'use client';

export default function SplitSettingsLayout({ title, left, right }) {
  return (
    <div>
      {/* Page Title */}
      {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}

      {/* Container */}
      <div className="border border-[#CFE3DF] rounded-xl p-6 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8">
        {/* Left Section */}
        <div>{left}</div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-gray-200"></div>

        {/* Right Section */}
        <div>{right}</div>
      </div>
    </div>
  );
}
