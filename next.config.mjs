/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sqlite3"],
  cacheComponents: true,
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
};

export default nextConfig;
