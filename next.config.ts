import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
})(nextConfig);
