"use client";

import { Construction, Hammer } from "lucide-react";

export default function UnderDevelopment({
  title = "Development in Progress",
  description = "We’re working hard to bring this feature to life. Please check back soon!",
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
        <Construction className="h-10 w-10 text-yellow-600" />
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-gray-900">
        {title}
      </h1>

      <p className="max-w-md text-sm text-gray-600">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
        <Hammer className="h-4 w-4" />
        <span>Feature under active development</span>
      </div>
    </div>
  );
}
