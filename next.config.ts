import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Таргетинг на современные браузеры - отключаем полифилы
  transpilePackages: [],
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'k-r.by',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  // Отключаем восстановление скролла
  experimental: {
    scrollRestoration: false,
    optimizeCss: true, // Оптимизация CSS для уменьшения критического пути
    optimizePackageImports: ['react-icons'], // Tree-shaking для иконок
    cssChunking: true, // Разделение CSS для уменьшения блокирующих запросов
  },
  // Настройка компилятора для современных браузеров
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  // Оптимизация для production
  poweredByHeader: false,
  compress: true,
  // Минимизация и оптимизация
  productionBrowserSourceMaps: false,
  // Добавляем поддержку статических файлов
  async rewrites() {
    return [
      {
        source: '/promo/:path*',
        destination: '/promo/:path*',
      },
      {
        source: '/accessories/:path*',
        destination: '/accessories/:path*',
      },
    ];
  },
};

export default nextConfig;
