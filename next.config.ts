import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/start",
        destination: "/dashboard/ai-employees/new",
        permanent: false,
      },
      {
        source: "/start-now",
        destination: "/dashboard/ai-employees/new",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/dashboard/ai-employees/new",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "/dashboard/ai-employees/new",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/signin",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
