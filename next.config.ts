const withPWA = require("next-pwa")({
  dest: "public",                 // Onde os arquivos do service worker serão gerados
  register: true,                // Registra o service worker automaticamente
  skipWaiting: true,            // Ativa o novo SW imediatamente após a atualização
  disable: process.env.NODE_ENV === "development", // Desativa em dev
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"], // Adicione outros domínios se necessário
  },
};

module.exports = withPWA(nextConfig);
