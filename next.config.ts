/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/sign-in",
        destination: "/api/auth/kinde/login",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/api/auth/kinde/register",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  turbopack: {
    resolveAlias: {
      canvas: "false",
      encoding: "false",
    },
  },
};

module.exports = nextConfig;
