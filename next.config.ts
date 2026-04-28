import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "zxzsmozlaehxdicppuuk.supabase.co",
      },
      {
        protocol: "https",
        hostname: "ecovistalife.in",
      },
      {
        protocol: "http",
        hostname: "ecovistalife.in",
      },
    ],
  },
};

export default nextConfig;
