import Link from 'next/link';
import { Eyebrow, OrnamentDivider, SectionCard } from '@/components/shared/wedding-ui';

export default async function DonePage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  return (
    <main className="wedding-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <SectionCard className="w-full max-w-md" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: 96,
            height: 96,
            margin: '0 auto 20px',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--gold)', borderRadius: '999px' }} />
          <div style={{ position: 'absolute', inset: 12, border: '1px solid var(--gold-soft)', borderRadius: '999px' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 28 }}>✓</div>
        </div>

        <Eyebrow>Thank you</Eyebrow>
        <h1 className="title-jp" style={{ fontSize: 24, lineHeight: 1.7, letterSpacing: '0.06em', marginTop: 10 }}>
          写真を<br />贈りました
        </h1>
        <div style={{ marginTop: 16 }}><OrnamentDivider wide={46} /></div>
        <p className="title-jp" style={{ marginTop: 18, fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.9 }}>
          まもなく披露宴のモニターに<br />
          あなたの一枚が映し出されます
        </p>

        <div className="wedding-panel" style={{ marginTop: 28, padding: '16px 18px', textAlign: 'left' }}>
          <div className="eyebrow">Album Notice</div>
          <div className="title-jp" style={{ marginTop: 6, fontSize: 12, lineHeight: 1.8 }}>
            後日アルバムページは、式のあとに公開します。<br />
            公開期限内で何度でも閲覧・ダウンロードできます。
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--gold)', letterSpacing: '0.12em' }}>公開期限: 2026.11.30 まで</div>
        </div>

        <Link href={`/e/${eventCode}`} className="btn-secondary title-serif" style={{ display: 'inline-block', marginTop: 28 }}>
          もう一枚 送る
        </Link>
      </SectionCard>
    </main>
  );
}
