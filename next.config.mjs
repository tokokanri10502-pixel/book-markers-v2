import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  // 下の runtimeCaching をデフォルト定義の前に追加する（置き換えではなく拡張）
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // ページ本体(HTML): 通常はネットワーク優先、2秒待って応答がなければ
        // 前回キャッシュで即表示する（遅い回線でも起動が固まらない）
        urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-navigate",
          networkTimeoutSeconds: 2,
          expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['books.google.com', 'books.google.co.jp'],
  },
};

export default withPWA(nextConfig);
