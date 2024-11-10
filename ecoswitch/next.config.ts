import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore 'fs' module for sql.js in client-side builds
      config.resolve.fallback = { fs: false };
    }
    return config;
  },
};


export default nextConfig;
