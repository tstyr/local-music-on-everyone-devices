import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Music Player",
  description: "高品質な音楽再生とマルチデバイス同期機能を備えた音楽プレイヤー",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Music Player",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Music Player" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="apple-touch-startup-image" href="/icon-512.svg" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // iOS Safari 100vh問題の解決
            function setVH() {
              const vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', vh + 'px');
            }
            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);
            
            // API接続の初期化
            (async function initAPI() {
              try {
                const { initializeApiConnection } = await import('/lib/api-config.ts');
                await initializeApiConnection();
              } catch (error) {
                console.error('[App] Failed to initialize API connection:', error);
              }
            })();
          `
        }} />
      </head>
      <body className="antialiased bg-black text-white overflow-hidden">
        <div className="h-screen flex flex-col">
          {children}
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Service Worker の登録（本番環境のみ）
            if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(registration => {
                    console.log('[PWA] Service Worker registered:', registration.scope);
                  })
                  .catch(error => {
                    console.error('[PWA] Service Worker registration failed:', error);
                  });
              });
            } else {
              console.log('[PWA] Service Worker disabled (localhost detected)');
            }
          `
        }} />
      </body>
    </html>
  );
}
