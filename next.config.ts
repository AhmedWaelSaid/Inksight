/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
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

  turbopack: {
    resolveAlias: {
      canvas: "false",
      encoding: "false",
    },
  },
};

module.exports = nextConfig;
