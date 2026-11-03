import type { NextConfig } from "next";

// Dirección interna del backend. Se evalúa en `next build`: el rewrite queda
// fijado en la imagen. En Docker vale http://backend:8080 (nombre del servicio).
const backendInternalUrl =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  // El navegador sólo habla con este origen. Next reenvía /api/* a Spring
  // sin tocar la petición: autenticación y reglas viven en el backend.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendInternalUrl}/api/:path*`,
      },
    ];
  },
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
