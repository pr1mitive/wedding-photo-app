import AlbumGallery from '@/components/album/AlbumGallery';
import { Eyebrow, OrnamentDivider, designPosts } from '@/components/shared/wedding-ui';

export default async function AlbumPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  const photos = designPosts.map((post, index) => ({
    id: `sample-${index + 1}`,
    src: post.src,
    guestName: post.guestName,
    comment: post.comment,
    time: post.time,
  }));

  return (
    <main className="wedding-shell" style={{ paddingBottom: 60 }}>
      <section style={{ padding: '52px 0 40px', borderBottom: '1px solid var(--hair-soft)', background: 'linear-gradient(180deg, var(--paper) 0%, var(--ivory) 100%)' }}>
        <div className="wedding-container" style={{ textAlign: 'center' }}>
          <Eyebrow>Wedding Album</Eyebrow>
          <h1 className="title-serif" style={{ fontSize: 48, fontStyle: 'italic', fontWeight: 300, marginTop: 14 }}>Yuki &amp; Haruto</h1>
          <div style={{ marginTop: 14 }}><OrnamentDivider wide={100} /></div>
          <p className="title-jp" style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-70)', letterSpacing: '0.1em' }}>
            みなさまが撮ってくださった、この日の記憶
          </p>
          <div style={{ marginTop: 22, fontSize: 10, color: 'var(--gold)', letterSpacing: '0.28em' }}>
            EVENT {eventCode.toUpperCase()} — {photos.length} MEMORIES
          </div>

          <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '10px 24px', background: 'rgba(251,249,244,0.92)', border: '1px solid var(--gold)', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 14, color: 'var(--gold)' }}>◷</span>
            <span className="title-jp" style={{ fontSize: 12 }}>
              公開期限 <span style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}>2026.11.30</span> まで
            </span>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--ink-50)' }}>
            期限までは何度でもご覧・ダウンロードいただけます
          </div>
        </div>
      </section>

      <section className="wedding-container" style={{ paddingTop: 34 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="title-serif" style={{ fontSize: 18, color: 'var(--gold)' }}>№ 01</div>
            <div className="title-jp" style={{ fontSize: 24, letterSpacing: '0.08em', marginTop: 4 }}>All Moments</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['ALL', '挙式', '披露宴', 'ハイライト'].map((label, index) => (
              <span key={label} style={{ padding: '6px 14px', border: `1px solid ${index === 0 ? 'var(--gold)' : 'var(--hair)'}`, color: index === 0 ? 'var(--gold)' : 'var(--ink-70)', fontSize: 10, letterSpacing: '0.2em' }}>
                {label}
              </span>
            ))}
            <span style={{ padding: '6px 14px', border: '1px solid var(--hair)', color: 'var(--ink-70)', fontSize: 10, letterSpacing: '0.2em' }}>
              DOWNLOAD ALL
            </span>
          </div>
        </div>

        <AlbumGallery photos={photos} />
      </section>

      <footer style={{ padding: '48px 0 64px', textAlign: 'center' }}>
        <OrnamentDivider wide={82} />
        <div className="title-serif" style={{ marginTop: 18, fontSize: 22, fontStyle: 'italic', color: 'var(--ink-70)' }}>
          Thank you for being part of our day.
        </div>
        <div className="title-jp" style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-50)', lineHeight: 1.9 }}>
          みなさまと過ごしたこの一日を、私たちは一生忘れません。<br />
          写真とともに残してくださって、ほんとうにありがとうございました。
        </div>
      </footer>
    </main>
  );
}
