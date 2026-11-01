import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: [
          {
            loader: "@tailwindcss/turbopack",
            options: {
              // Tailwind's native production optimizer currently exits before
              // Turbopack can connect to it on this Windows setup. Next still
              // performs its normal production CSS processing afterwards.
              optimize: false,
            },
          },
        ],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
