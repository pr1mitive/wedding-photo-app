import Link from 'next/link';
import { Eyebrow, OrnamentDivider, SectionCard } from '@/components/shared/wedding-ui';

const links = [
  { href: '/e/wedding-test', label: 'ゲスト投稿ページ', en: 'Guest Post' },
  { href: '/e/wedding-test/display', label: 'モニター表示', en: 'Live Monitor' },
  { href: '/admin/login', label: '管理ログイン', en: 'Admin Login' },
  { href: '/album/wedding-test', label: '後日アルバム', en: 'Memory Album' },
];

export default function HomePage() {
  return (
    <main className="wedding-shell" style={{ padding: '48px 0 72px' }}>
      <div className="wedding-container">
        <SectionCard style={{ padding: '48px 36px' }}>
          <div style={{ textAlign: 'center' }}>
            <Eyebrow>Wedding Photo Sharing</Eyebrow>
            <h1 className="title-serif" style={{ fontSize: 54, fontStyle: 'italic', fontWeight: 300, marginTop: 14 }}>
              Memoire
            </h1>
            <div style={{ marginTop: 12 }}><OrnamentDivider wide={104} /></div>
            <p className="title-jp" style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.9, letterSpacing: '0.08em' }}>
              結婚式当日の写真をリアルタイムで共有し、
              披露宴のモニターに上品に映し出すためのWebアプリです。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 32 }}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="wedding-panel" style={{ padding: '18px 18px 20px', display: 'block' }}>
                <div className="eyebrow">{link.en}</div>
                <div className="title-jp" style={{ fontSize: 18, marginTop: 10, letterSpacing: '0.06em' }}>{link.label}</div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-50)' }}>{link.href}</div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
