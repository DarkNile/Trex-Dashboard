import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Tell Next.js not to attempt static optimization for routes that use client-side data fetching
  unstable_runtimeJS: true,
};

export default nextConfig;
