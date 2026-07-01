/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静的サイトとして書き出す設定
  basePath: '/photo-calendar', // GitHub PagesのURLのズレを直す設定
  images: {
    unoptimized: true, // 画像最適化機能をオフ（GitHub Pages用）
  },
};

export default nextConfig;