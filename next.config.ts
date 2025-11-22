import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack конфигурация для Next.js 16+
  turbopack: {
    // Пустой объект для использования дефолтных настроек Turbopack
  },
  // Таргетинг на современные браузеры - отключаем полифилы через SWC
  transpilePackages: [],
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
  // Настройки для современных браузеров
  env: {
    BROWSERSLIST_ENV: 'production',
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
    cssChunking: 'strict', // Строгое разделение CSS для оптимизации загрузки
    swcPlugins: [],
  },
  // Настройка компилятора для современных браузеров (SWC)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  // Минимальная целевая версия JS для современных браузеров
  // Оптимизации теперь обрабатываются Turbopack автоматически
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
