import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Rutas en español -> rutas reales de la app
      { source: "/subir", destination: "/upload", permanent: false },
      { source: "/documentos", destination: "/documents", permanent: false },
      { source: "/buscar", destination: "/search/results", permanent: false },
    ];
  },
  async rewrites() {
    // Tunnel same-origin al backend: permite cookies HttpOnly y evita exponer CORS.
    return [
      {
        source: "/api/backend/:path*",
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    const common = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    if (isProduction) {
      common.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }
    return [{ source: "/:path*", headers: common }];
  },
};

export default nextConfig;
