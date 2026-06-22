/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [256, 384, 512],
  },
};
export default nextConfig;
