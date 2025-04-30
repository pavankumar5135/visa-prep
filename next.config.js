/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we have proper redirects
  async redirects() {
    return [];
  },
  // Use APP directory
  experimental: {
    appDir: true,
  },
  // Disable server components to ensure client-side navigation works properly
  reactStrictMode: true,
};

module.exports = nextConfig; 