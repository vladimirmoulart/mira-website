import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Supprimez complètement swcMinify - il n'existe plus dans Next.js 15
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
