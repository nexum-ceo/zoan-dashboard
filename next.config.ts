import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_STORAGE_HOSTNAME || 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
