// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"], // Agrega el dominio de Firebase Storage
  },
};

export default nextConfig;