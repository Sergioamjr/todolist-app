import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
      {
        source: "/items/:path*",
        destination: `${apiUrl}/items/:path*`,
      },
      {
        source: "/items",
        destination: `${apiUrl}/items/`,
      },
    ];
  },
};

export default nextConfig;
