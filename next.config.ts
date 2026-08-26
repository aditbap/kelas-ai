import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder photography. Replace with real brand photography before launch.
      { protocol: 'https', hostname: 'picsum.photos' },
      // Real first-party SVG logos for the tool strip.
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
    ],
  },
};

export default nextConfig;
