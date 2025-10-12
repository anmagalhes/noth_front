// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import CoreProvider from "@/components/query_lado_cliente/core-provider";
import AppWrapper from "./AppWrapper";

export const metadata: Metadata = {
  title: "Northcromo - Sistema de Manutenção",
  description: "Sistema de Gestão da Northcromo",
  icons: {
    icon: "/favicon.ico",
  },
  authors: [{ name: "Northcromo" }],
};

export function generateViewport() {
  return {
    themeColor: "#ffffff",
  };
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NorthCromo" />
      </head>
      <body className="antialiased bg-gray-50 min-h-screen flex flex-col overflow-y-auto">
        {/* CoreProvider envolve a aplicação com o QueryClient */}
        <CoreProvider>
          <AppWrapper>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </AppWrapper>
        </CoreProvider>
      </body>
    </html>
  );
}
