/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    //INFO: How to override kinde auth pathnames!, api/auth/login is kinde default path, sign-in is ours
    return [
      {
        source: "/sign-in",
        destination: "/api/auth/login",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/api/auth/register",
        permanent: true,
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },

};

module.exports = nextConfig;
