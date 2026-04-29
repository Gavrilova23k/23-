/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/w/**',
      },
    ],
  },
  
  // Добавляем пустую конфигурацию Turbopack для совместимости
  turbopack: {},
};

module.exports = nextConfig;