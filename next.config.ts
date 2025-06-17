/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.pinimg.com'],
  },
  swcMinify: true, // Utiliser SWC pour la minification
}

module.exports = nextConfig
