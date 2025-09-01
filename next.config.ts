import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minio.buymed.site',
        port: '',
        pathname: '/**',
      },
    ],
    // unoptimized: true,
  },
};

export default nextConfig;
