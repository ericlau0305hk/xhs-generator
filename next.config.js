/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  env: {
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
    KIMI_API_KEY: process.env.KIMI_API_KEY,
  },
};

module.exports = nextConfig;
