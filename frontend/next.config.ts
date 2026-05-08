import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  transpilePackages: ["cesium"],

  webpack: (config) => {
    // CesiumJS AMD 모듈 시스템 설정
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      })
    );

    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // API 프록시: 브라우저 /api/backend/* → Next.js 서버 → 백엔드
  // BACKEND_INTERNAL_URL: Docker 내부 URL (예: http://backend:8000)
  // 미설정 시 로컬 개발 기본값 사용
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
