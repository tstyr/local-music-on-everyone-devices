/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  // Cloudflare Pages用の設定
  distDir: 'out',
}

module.exports = nextConfig
