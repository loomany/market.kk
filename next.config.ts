import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/ru/cost",
        permanent: true,
      },
      {
        source: "/:locale/pricing",
        destination: "/:locale/cost",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
