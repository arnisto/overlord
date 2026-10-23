import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image Docker minimale (voir frontend/Dockerfile).
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
