import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "betterfoodcoltd.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/cart",
        destination: "/quote-list/",
        permanent: true,
      },
      {
        source: "/cart/",
        destination: "/quote-list/",
        permanent: true,
      },
      {
        source: "/checkout",
        destination: "/quote-list/",
        permanent: true,
      },
      {
        source: "/checkout/",
        destination: "/quote-list/",
        permanent: true,
      },
      {
        source: "/my-account",
        destination: "/contact-us/",
        permanent: true,
      },
      {
        source: "/my-account/",
        destination: "/contact-us/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
