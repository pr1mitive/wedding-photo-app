'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

type Photo = {
  id: string;
  thumbUrl: string;
  displayUrl: string;
  guestName: string;
  comment: string | null;
  timelineLabel: string | null;
  isFavorite: boolean;
  isHighlight: boolean;
  isHidden: boolean;
  createdAt: string;
};

type Props = {
  eventCode: string;
};

export default function AdminPhotoList({ eventCode }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchPhotos = async () => {
      const res = await fetch(`/api/admin/events/${eventCode}/photos`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setPhotos(json.data.photos);
        setSelectedId((current) => current || json.data.photos[0]?.id || '');
      }
    };
    fetchPhotos();
  }, [eventCode]);

  const filtered = useMemo(() => {
    if (!query.trim()) return photos;
    const q = query.trim();
    return photos.filter((photo) => photo.guestName.includes(q) || photo.comment?.includes(q) || photo.timelineLabel?.includes(q));
  }, [photos, query]);

  const selected = filtered.find((photo) => photo.id === selectedId) || filtered[0] || null;

  return (
    <div className="wedding-shell" style={{ minHeight: 'calc(100vh - 73px)' }}>
      <div className="wedding-container" style={{ padding: '28px 0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '290px minmax(0,1fr) 340px', gap: 18 }}>
          <aside className="wedding-card" style={{ padding: 18 }}>
            <Eyebrow>Views</Eyebrow>
            <div className="title-jp" style={{ fontSize: 18, marginTop: 8, letterSpacing: '0.06em' }}>投稿一覧</div>
            <div style={{ marginTop: 14, border: '1px solid var(--hair)', background: 'rgba(245,239,230,0.65)', padding: '10px 12px' }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="投稿者名・コメントで検索"
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'var(--ink)', fontSize: 12 }}
              />
            </div>

            <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
              <Metric label="TOTAL POSTS" value={photos.length} />
              <Metric label="VISIBLE" value={photos.filter((p) => !p.isHidden).length} />
              <Metric label="HIGHLIGHT" value={photos.filter((p) => p.isHighlight).length} />
            </div>
          </aside>

          <main className="wedding-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 14 }}>
              <div>
                <Eyebrow>Posts</Eyebrow>
                <div className="title-jp" style={{ fontSize: 18, marginTop: 6 }}>全ての投稿</div>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-50)' }}>{filtered.length} ITEMS</div>
            </div>

            <div className="photo-grid">
              {filtered.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedId(photo.id)}
                  style={{
                    border: selected?.id === photo.id ? '1px solid var(--gold)' : '1px solid var(--hair)',
                    background: 'rgba(251,249,244,0.85)',
                    padding: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: 'var(--paper)' }}>
                    <img src={photo.thumbUrl} alt={photo.guestName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '10px 4px 2px' }}>
                    <div className="title-jp" style={{ fontSize: 13 }}>{photo.guestName}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-50)', marginTop: 3, lineHeight: 1.7, minHeight: 34 }}>
                      {photo.comment || 'コメントなし'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </main>

          <aside className="wedding-card" style={{ padding: 18 }}>
            {!selected ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-50)' }}>写真を選択してください</div>
            ) : (
              <>
                <Eyebrow>Detail</Eyebrow>
                <div style={{ marginTop: 10 }} className="surface-frame">
                  <div className="surface-frame__inner">
                    <img src={selected.displayUrl} alt={selected.guestName} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="title-jp" style={{ fontSize: 18 }}>{selected.guestName}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-50)', marginTop: 4 }}>
                    {new Date(selected.createdAt).toLocaleString('ja-JP')}
                  </div>
                </div>

                <div style={{ marginTop: 14 }}><OrnamentDivider wide={52} /></div>

                <div style={{ marginTop: 14, padding: 14, border: '1px solid var(--hair)', background: 'rgba(245,239,230,0.7)' }}>
                  <div className="title-jp" style={{ fontSize: 13, lineHeight: 1.8 }}>
                    「{selected.comment || 'コメントなし'}」
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                  <ActionLabel label="お気に入り" active={selected.isFavorite} />
                  <ActionLabel label="モニターに大表示" active={selected.isHighlight} />
                  <ActionLabel label="非表示" active={selected.isHidden} />
                  <ActionLabel label="タイムライン" value={selected.timelineLabel || '未設定'} />
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="wedding-panel" style={{ padding: '12px 14px' }}>
      <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div className="title-serif" style={{ fontSize: 32, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function ActionLabel({ label, active, value }: { label: string; active?: boolean; value?: string }) {
  return (
    <div style={{ border: '1px solid var(--hair)', padding: '10px 12px', background: active ? 'rgba(243,228,225,0.55)' : 'transparent' }}>
      <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div className="title-jp" style={{ fontSize: 12, marginTop: 5, color: active ? 'var(--gold)' : 'var(--ink)' }}>
        {value || (active ? 'ON' : 'OFF')}
      </div>
    </div>
  );
}
