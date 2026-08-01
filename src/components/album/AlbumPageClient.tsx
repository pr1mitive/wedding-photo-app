'use client';

import { useEffect, useMemo, useState } from 'react';
import AlbumGallery, { type AlbumPhoto } from '@/components/album/AlbumGallery';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

type Props = {
  eventCode: string;
};

type AlbumResponse = {
  success: boolean;
  data?: {
    eventTitle: string;
    eventCode: string;
    albumPublicUntil: string | null;
    photos: AlbumPhoto[];
  };
  error?: {
    code: string;
    message: string;
  };
};

export default function AlbumPageClient({ eventCode }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventTitle, setEventTitle] = useState('Wataru & Misaki');
  const [albumPublicUntil, setAlbumPublicUntil] = useState<string | null>(null);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/public/album/${eventCode}/photos`, { cache: 'no-store' });
        const json = (await res.json()) as AlbumResponse;
        if (!res.ok || !json.success || !json.data) {
          throw new Error(
            json.error?.code === 'ALBUM_CLOSED' ? 'アルバムの公開期限が終了しました。' : 'アルバムの読み込みに失敗しました。',
          );
        }
        setEventTitle(json.data.eventTitle || 'Wataru & Misaki');
        setAlbumPublicUntil(json.data.albumPublicUntil || null);
        setPhotos(json.data.photos || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'アルバムの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [eventCode]);

  const albumExpiryLabel = useMemo(() => {
    if (!albumPublicUntil) return '未設定';
    return new Date(albumPublicUntil).toLocaleString('ja-JP');
  }, [albumPublicUntil]);

  if (loading) {
    return (
      <main className="wedding-shell" style={{ paddingBottom: 60 }}>
        <section className="wedding-container" style={{ paddingTop: 80 }}>
          <div className="wedding-card" style={{ padding: 32, textAlign: 'center' }}>
            <Eyebrow>Wedding Album</Eyebrow>
            <div className="title-jp" style={{ marginTop: 10, fontSize: 24 }}>アルバムを読み込んでいます</div>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="wedding-shell" style={{ paddingBottom: 60 }}>
        <section className="wedding-container" style={{ paddingTop: 80 }}>
          <div className="wedding-card" style={{ padding: 32, textAlign: 'center' }}>
            <Eyebrow>Wedding Album</Eyebrow>
            <div className="title-jp" style={{ marginTop: 10, fontSize: 24 }}>{error}</div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="wedding-shell" style={{ paddingBottom: 60 }}>
      <section style={{ padding: '52px 0 40px', borderBottom: '1px solid var(--hair-soft)', background: 'linear-gradient(180deg, var(--paper) 0%, var(--ivory) 100%)' }}>
        <div className="wedding-container" style={{ textAlign: 'center' }}>
          <Eyebrow>Wedding Album</Eyebrow>
          <h1 className="title-serif" style={{ fontSize: 48, fontStyle: 'italic', fontWeight: 300, marginTop: 14 }}>Wataru &amp; Misaki</h1>
          <div style={{ marginTop: 14 }}><OrnamentDivider wide={100} /></div>
          <p className="title-jp" style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-70)', letterSpacing: '0.1em' }}>
            みなさまが撮ってくださった、この日の記憶
          </p>
          <div style={{ marginTop: 22, fontSize: 10, color: 'var(--gold)', letterSpacing: '0.28em' }}>
            EVENT {eventCode.toUpperCase()} — {photos.length} MEMORIES
          </div>

          <div style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '10px 24px', background: 'rgba(251,249,244,0.92)', border: '1px solid var(--gold)', whiteSpace: 'nowrap', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--gold)' }}>◷</span>
            <span className="title-jp" style={{ fontSize: 12 }}>
              公開期限 <span style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}>{albumExpiryLabel}</span>
            </span>
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--ink-50)' }}>
            期限までは何度でもご覧・ダウンロードいただけます
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-50)' }}>{eventTitle}</div>
        </div>
      </section>

      <section className="wedding-container" style={{ paddingTop: 34 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="title-serif" style={{ fontSize: 18, color: 'var(--gold)' }}>№ 01</div>
            <div className="title-jp" style={{ fontSize: 24, letterSpacing: '0.08em', marginTop: 4 }}>All Moments</div>
          </div>
          <a
            href={`/api/public/album/${eventCode}/photos`}
            target="_blank"
            rel="noreferrer"
            style={{ padding: '6px 14px', border: '1px solid var(--hair)', color: 'var(--ink-70)', fontSize: 10, letterSpacing: '0.2em' }}
          >
            ALBUM DATA
          </a>
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
