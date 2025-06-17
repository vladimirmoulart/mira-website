const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.pinimg.com'],
  },
  swcMinify: true,  // Utilise SWC pour la minification au lieu de Babel
}

module.exports = nextConfig
