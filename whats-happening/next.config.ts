import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true, // TypeScript build hatalarını yoksayar
  },
  eslint: {
    ignoreDuringBuilds: true, // ESLint build hatalarını yoksayar
  },
};

export default nextConfig;
