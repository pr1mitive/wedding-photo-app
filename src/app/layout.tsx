import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Photo App',
  description: '結婚式向けリアルタイム写真共有アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
