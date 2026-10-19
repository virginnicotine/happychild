import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/home.html", destination: "/" },
      { source: "/index.html", destination: "/" },
      { source: "/admin.html", destination: "/cabinet" },
      { source: "/playgrounds.html", destination: "/playgrounds" },
      { source: "/parts.html", destination: "/parts" },
      { source: "/assemblies.html", destination: "/assemblies" },
      { source: "/changelog.html", destination: "/changelog" },
      { source: "/product.html", destination: "/product/1.06" },
      { source: "/product-:code.html", destination: "/product/:code" },
    ];
  },
};

export default nextConfig;
