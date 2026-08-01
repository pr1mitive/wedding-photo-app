'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

type ReactionCounts = {
  heart: number;
  clap: number;
  wow: number;
  cry: number;
  fire: number;
  total: number;
};

type Photo = {
  id: string;
  thumbUrl: string;
  displayUrl: string;
  originalUrl: string;
  guestName: string;
  comment: string | null;
  timelineLabel: string | null;
  isFavorite: boolean;
  isHighlight: boolean;
  isHidden: boolean;
  isRecommended: boolean;
  createdAt: string;
  reactions: ReactionCounts;
};

type Props = {
  eventCode: string;
};

type FilterType = 'all' | 'favorite' | 'highlight' | 'recommended' | 'hidden';

export default function AdminPhotoList({ eventCode }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [timelineInput, setTimelineInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchPhotos = async () => {
    const res = await fetch(`/api/admin/events/${eventCode}/photos`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success) {
      setPhotos(json.data.photos);
      setSelectedId((current) => current || json.data.photos[0]?.id || '');
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [eventCode]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return photos.filter((photo) => {
      const matchFilter =
        filter === 'all' ||
        (filter === 'favorite' && photo.isFavorite) ||
        (filter === 'highlight' && photo.isHighlight) ||
        (filter === 'recommended' && photo.isRecommended) ||
        (filter === 'hidden' && photo.isHidden);

      const matchQuery =
        !q ||
        photo.guestName.includes(q) ||
        photo.comment?.includes(q) ||
        photo.timelineLabel?.includes(q);

      return matchFilter && matchQuery;
    });
  }, [photos, query, filter]);

  const selected = filtered.find((photo) => photo.id === selectedId) || photos.find((photo) => photo.id === selectedId) || filtered[0] || photos[0] || null;

  useEffect(() => {
    setTimelineInput(selected?.timelineLabel || '');
  }, [selected?.id, selected?.timelineLabel]);

  const updatePhoto = async (photoId: string, payload: Record<string, unknown>, successMessage: string) => {
    setSaving(true);
    setToast('');
    try {
      const res = await fetch(`/api/admin/events/${eventCode}/photos/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message || '更新に失敗しました');

      const nextPhoto: Photo = json.data.photo;
      setPhotos((current) => current.map((photo) => (photo.id === photoId ? nextPhoto : photo)));
      setToast(successMessage);
    } catch (error) {
      setToast(error instanceof Error ? error.message : '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wedding-shell" style={{ minHeight: 'calc(100vh - 73px)' }}>
      <div className="wedding-container" style={{ padding: '28px 0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr) 360px', gap: 18 }}>
          <aside className="wedding-card" style={{ padding: 18 }}>
            <Eyebrow>Control</Eyebrow>
            <div className="title-jp" style={{ fontSize: 18, marginTop: 8, letterSpacing: '0.06em' }}>投稿管理</div>
            <div style={{ marginTop: 14, border: '1px solid var(--hair)', background: 'rgba(245,239,230,0.65)', padding: '10px 12px' }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="投稿者名・コメントで検索"
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'var(--ink)', fontSize: 12 }}
              />
            </div>

            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              {[
                ['all', `すべて (${photos.length})`],
                ['favorite', `お気に入り (${photos.filter((p) => p.isFavorite).length})`],
                ['highlight', `ハイライト (${photos.filter((p) => p.isHighlight).length})`],
                ['recommended', `おすすめ枠 (${photos.filter((p) => p.isRecommended).length})`],
                ['hidden', `非表示 (${photos.filter((p) => p.isHidden).length})`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key as FilterType)}
                  style={{
                    border: `1px solid ${filter === key ? 'var(--gold)' : 'var(--hair)'}`,
                    background: filter === key ? 'rgba(243,228,225,0.5)' : 'rgba(251,249,244,0.8)',
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div className="title-jp" style={{ fontSize: 12 }}>{label}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
              <Metric label="TOTAL POSTS" value={photos.length} />
              <Metric label="VISIBLE" value={photos.filter((p) => !p.isHidden).length} />
              <Metric label="REACTIONS" value={photos.reduce((sum, photo) => sum + photo.reactions.total, 0)} />
            </div>

            <button type="button" className="btn-secondary title-serif" style={{ width: '100%', marginTop: 18 }} onClick={fetchPhotos}>
              更新する
            </button>
          </aside>

          <main className="wedding-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <Eyebrow>Posts</Eyebrow>
                <div className="title-jp" style={{ fontSize: 18, marginTop: 6 }}>投稿一覧</div>
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
                    background: photo.isHidden ? 'rgba(230,230,230,0.55)' : 'rgba(251,249,244,0.85)',
                    padding: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                    opacity: photo.isHidden ? 0.75 : 1,
                  }}
                >
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: 'var(--paper)', position: 'relative' }}>
                    <img src={photo.thumbUrl} alt={photo.guestName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.32))' }} />
                    <div style={{ position: 'absolute', left: 8, top: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {photo.isFavorite && <Badge label="FAV" />}
                      {photo.isHighlight && <Badge label="UP" />}
                      {photo.isRecommended && <Badge label="PICK" />}
                      {photo.isHidden && <Badge label="HIDE" />}
                    </div>
                    {photo.reactions.total > 0 && (
                      <div style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(251,249,244,0.92)', border: '1px solid rgba(184,151,92,0.75)', padding: '4px 8px', fontSize: 10, color: 'var(--gold)' }}>
                        ♥ {photo.reactions.total}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 4px 2px' }}>
                    <div className="title-jp" style={{ fontSize: 13 }}>{photo.guestName}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-50)', marginTop: 3, lineHeight: 1.7, minHeight: 34 }}>
                      {photo.comment || 'コメントなし'}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 9, color: 'var(--gold)', letterSpacing: '0.12em' }}>{photo.timelineLabel || 'TIMELINE 未設定'}</div>
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

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
                  <ReactionStat label="♡" value={selected.reactions.heart} />
                  <ReactionStat label="👏" value={selected.reactions.clap} />
                  <ReactionStat label="✨" value={selected.reactions.wow} />
                  <ReactionStat label="🥲" value={selected.reactions.cry} />
                  <ReactionStat label="🔥" value={selected.reactions.fire} />
                  <ReactionStat label="TOTAL" value={selected.reactions.total} />
                </div>

                <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                  <button type="button" onClick={() => updatePhoto(selected.id, { isFavorite: !selected.isFavorite }, selected.isFavorite ? 'お気に入りを解除しました' : 'お気に入りに追加しました')} className="actionButton">
                    お気に入り: {selected.isFavorite ? 'ON' : 'OFF'}
                  </button>
                  <button type="button" onClick={() => updatePhoto(selected.id, { isHighlight: !selected.isHighlight }, selected.isHighlight ? 'アップ表示を解除しました' : 'アップ表示に設定しました')} className="actionButton">
                    モニター大表示: {selected.isHighlight ? 'ON' : 'OFF'}
                  </button>
                  <button type="button" onClick={() => updatePhoto(selected.id, { isRecommended: !selected.isRecommended }, selected.isRecommended ? 'おすすめ枠から外しました' : 'おすすめ枠に設定しました')} className="actionButton">
                    今のおすすめ写真: {selected.isRecommended ? 'ON' : 'OFF'}
                  </button>
                  <button type="button" onClick={() => updatePhoto(selected.id, { isHidden: !selected.isHidden }, selected.isHidden ? '再表示しました' : '非表示にしました')} className="actionButton">
                    非表示: {selected.isHidden ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>Timeline Label</div>
                  <input value={timelineInput} onChange={(e) => setTimelineInput(e.target.value.slice(0, 30))} className="field-line title-jp" placeholder="例: 挙式 / 乾杯 / ケーキ" />
                  <button type="button" className="btn-secondary title-serif" style={{ width: '100%', marginTop: 10 }} onClick={() => updatePhoto(selected.id, { timelineLabel: timelineInput || null }, 'タイムラインを更新しました')}>
                    タイムラインを保存
                  </button>
                </div>

                <a href={selected.originalUrl} target="_blank" rel="noreferrer" className="btn-primary title-serif" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14 }}>
                  元画像をダウンロード
                </a>

                {toast && <div style={{ marginTop: 12, fontSize: 11, color: 'var(--gold)', lineHeight: 1.7 }}>{toast}</div>}
                {saving && <div style={{ marginTop: 6, fontSize: 10, color: 'var(--ink-50)' }}>保存中…</div>}
              </>
            )}
          </aside>
        </div>
      </div>
      <style>{`.actionButton{border:1px solid var(--hair);padding:10px 12px;background:rgba(251,249,244,0.85);text-align:left;cursor:pointer;font-size:12px;color:var(--ink);}`}</style>
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

function Badge({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 9, letterSpacing: '0.15em', background: 'rgba(251,249,244,0.92)', border: '1px solid rgba(184,151,92,0.75)', color: 'var(--gold)', padding: '3px 6px' }}>
      {label}
    </span>
  );
}

function ReactionStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="wedding-panel" style={{ padding: '10px 8px', textAlign: 'center' }}>
      <div className="title-serif" style={{ fontSize: 12, color: 'var(--gold)' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}
