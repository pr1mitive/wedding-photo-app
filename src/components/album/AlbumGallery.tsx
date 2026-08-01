'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

export type AlbumPhoto = {
  id: string;
  src: string;
  originalUrl: string;
  guestName: string;
  comment: string;
  timelineLabel: string | null;
  isFavorite: boolean;
  isHighlight: boolean;
  createdAt: string;
};

type Props = {
  photos: AlbumPhoto[];
};

type FilterKey = 'all' | 'highlight' | 'favorite';

export default function AlbumGallery({ photos }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedTimeline, setSelectedTimeline] = useState<string>('all');

  const timelineOptions = useMemo(() => {
    const values = Array.from(new Set(photos.map((photo) => photo.timelineLabel).filter(Boolean))) as string[];
    return ['all', ...values];
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'highlight' && photo.isHighlight) ||
        (filter === 'favorite' && photo.isFavorite);
      const matchesTimeline = selectedTimeline === 'all' || photo.timelineLabel === selectedTimeline;
      return matchesFilter && matchesTimeline;
    });
  }, [filter, photos, selectedTimeline]);

  const rows = useMemo(() => {
    const source = filteredPhotos;
    const groups: AlbumPhoto[][] = [];
    for (let i = 0; i < source.length; ) {
      const pattern = groups.length % 3;
      const size = pattern === 0 ? 2 : pattern === 1 ? 3 : 4;
      groups.push(source.slice(i, i + size));
      i += size;
    }
    return groups.filter((row) => row.length > 0);
  }, [filteredPhotos]);

  const selectedPhoto = selected !== null ? filteredPhotos[selected] : null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['all', 'ALL'],
            ['highlight', 'ハイライト'],
            ['favorite', 'お気に入り'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key as FilterKey);
                setSelected(null);
              }}
              style={{
                padding: '6px 14px',
                border: `1px solid ${filter === key ? 'var(--gold)' : 'var(--hair)'}`,
                color: filter === key ? 'var(--gold)' : 'var(--ink-70)',
                background: filter === key ? 'rgba(243,228,225,0.45)' : 'transparent',
                fontSize: 10,
                letterSpacing: '0.2em',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {timelineOptions.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setSelectedTimeline(label);
                setSelected(null);
              }}
              style={{
                padding: '6px 14px',
                border: `1px solid ${selectedTimeline === label ? 'var(--gold)' : 'var(--hair)'}`,
                color: selectedTimeline === label ? 'var(--gold)' : 'var(--ink-70)',
                background: selectedTimeline === label ? 'rgba(243,228,225,0.45)' : 'transparent',
                fontSize: 10,
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}
            >
              {label === 'all' ? 'すべての時間帯' : label}
            </button>
          ))}
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="wedding-card" style={{ padding: 30, textAlign: 'center' }}>
          <Eyebrow>No Photos</Eyebrow>
          <div className="title-jp" style={{ marginTop: 10, fontSize: 20 }}>該当する写真がまだありません</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  row.length === 1
                    ? '1fr'
                    : row.length === 2
                      ? '7fr 5fr'
                      : row.length === 3
                        ? 'repeat(3, 1fr)'
                        : 'repeat(4, 1fr)',
                gap: 14,
              }}
            >
              {row.map((photo, colIndex) => {
                const aspect = row.length === 2 ? (colIndex === 0 ? '4 / 3' : '4 / 5') : row.length === 1 ? '16 / 9' : '1 / 1';
                const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelected(idx)}
                    style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ position: 'relative', aspectRatio: aspect, overflow: 'hidden', background: 'var(--paper)' }}>
                      <img src={photo.src} alt={photo.guestName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.42))' }} />
                      <div style={{ position: 'absolute', left: 12, top: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {photo.isHighlight && <Chip label="HIGHLIGHT" />}
                        {photo.isFavorite && <Chip label="FAVORITE" />}
                        {photo.timelineLabel && <Chip label={photo.timelineLabel} />}
                      </div>
                      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12, color: '#fff' }}>
                        <div className="title-serif" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#f3dec0' }}>
                          № {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="title-jp" style={{ fontSize: 12, marginTop: 2 }}>from {photo.guestName}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          index={selected ?? 0}
          total={filteredPhotos.length}
          onClose={() => setSelected(null)}
          onPrev={() => setSelected(((selected ?? 0) - 1 + filteredPhotos.length) % filteredPhotos.length)}
          onNext={() => setSelected(((selected ?? 0) + 1) % filteredPhotos.length)}
        />
      )}
    </>
  );
}

function Lightbox({
  photo,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: AlbumPhoto;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,13,11,0.94)', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '32px 40px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f3dec0', gap: 20 }}>
        <div>
          <Eyebrow>Album · {String(index + 1).padStart(3, '0')} / {String(total).padStart(3, '0')}</Eyebrow>
          <div className="title-jp" style={{ fontSize: 16, marginTop: 6, color: '#f8f1e6' }}>from {photo.guestName}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href={photo.originalUrl} target="_blank" rel="noreferrer" style={{ border: '1px solid rgba(243,222,192,0.55)', padding: '10px 14px', color: '#f8f1e6', fontSize: 11, letterSpacing: '0.15em' }} onClick={(e) => e.stopPropagation()}>
            DOWNLOAD
          </a>
          <button type="button" onClick={onClose} style={{ background: 'transparent', color: '#f8f1e6', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onPrev} style={navButtonStyle}>‹</button>
        <div className="surface-frame" style={{ maxWidth: '78vw' }}>
          <div className="surface-frame__inner">
            <img src={photo.src} alt={photo.guestName} style={{ display: 'block', maxHeight: '72vh', maxWidth: '72vw', width: 'auto', height: 'auto' }} />
          </div>
        </div>
        <button type="button" onClick={onNext} style={navButtonStyle}>›</button>
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', color: '#f8f1e6' }}>
        <OrnamentDivider wide={72} />
        <div className="title-jp" style={{ fontSize: 16, marginTop: 14, lineHeight: 1.8 }}>「{photo.comment || 'コメントなし'}」</div>
        <div style={{ marginTop: 8, fontSize: 10, letterSpacing: '0.18em', color: '#f3dec0' }}>
          {photo.timelineLabel || 'MEMORY'} · POSTED {new Date(photo.createdAt).toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 9, letterSpacing: '0.12em', background: 'rgba(251,249,244,0.92)', border: '1px solid rgba(184,151,92,0.75)', color: 'var(--gold)', padding: '3px 6px' }}>
      {label}
    </span>
  );
}

const navButtonStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  border: '1px solid rgba(243,222,192,0.5)',
  background: 'transparent',
  color: '#f8f1e6',
  fontSize: 28,
  cursor: 'pointer',
};
