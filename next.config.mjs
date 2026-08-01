/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce the minimal Node.js server bundle used by the production container.
  output: "standalone",
  // Allow devices on the local network to load Next.js development assets.
  // This setting applies to the dev server's origin checks for /_next/*.
  allowedDevOrigins: ["192.168.1.5"],
  images: {
    // next/image fetches remote URLs on the server; localhost resolves to 127.0.0.1
    // and is blocked as a private IP unless this is enabled (Medusa static on :9001).
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV === "development" ||
      process.env.ALLOW_LOCAL_IMAGE_IP === "true",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "devadmin.nanaorganics.co",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "devapi.nanaorganics.co",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "devapi.nanaorganics.co",
        pathname: "/static/**",
      },
      // Medusa file module / admin static uploads (local dev)
      {
        protocol: "http",
        hostname: "localhost",
        port: "9001",
        pathname: "/static/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9001",
        pathname: "/static/**",
      },
      // Medusa API on default port (if static assets are served there)
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/static/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/static/**",
      },
      // Vendure asset server used by the Shop API collection response
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
