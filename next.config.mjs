/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-85c68dae5a244ee6abc7105e62067ea7.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
