'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

type Photo = {
  id: string;
  src: string;
  guestName: string;
  comment: string;
  time: string;
};

type Props = {
  photos: Photo[];
};

export default function AlbumGallery({ photos }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const rows = useMemo(
    () => [
      [photos[0], photos[1]],
      [photos[2], photos[3], photos[4]],
      [photos[5], photos[6]],
      [photos[7], photos[0], photos[2], photos[4]],
    ].filter((row) => row.every(Boolean)),
    [photos],
  );

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'grid',
              gridTemplateColumns: row.length === 2 ? '7fr 5fr' : row.length === 3 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
              gap: 14,
            }}
          >
            {row.map((photo, colIndex) => {
              const aspect = row.length === 2 ? (colIndex === 0 ? '4 / 3' : '4 / 5') : '1 / 1';
              const idx = photos.findIndex((p) => p.id === photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelected(idx)}
                  style={{
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: aspect, overflow: 'hidden', background: 'var(--paper)' }}>
                    <img src={photo.src} alt={photo.guestName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.38))' }} />
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

      {selected !== null && photos[selected] && (
        <Lightbox
          photo={photos[selected]}
          index={selected}
          total={photos.length}
          onClose={() => setSelected(null)}
          onPrev={() => setSelected((selected - 1 + photos.length) % photos.length)}
          onNext={() => setSelected((selected + 1) % photos.length)}
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
  photo: Photo;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,13,11,0.94)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 40px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f3dec0' }}>
        <div>
          <Eyebrow>Album · {String(index + 1).padStart(3, '0')} / {String(total).padStart(3, '0')}</Eyebrow>
          <div className="title-jp" style={{ fontSize: 16, marginTop: 6, color: '#f8f1e6' }}>from {photo.guestName}</div>
        </div>
        <button type="button" onClick={onClose} style={{ background: 'transparent', color: '#f8f1e6', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
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
        <div className="title-jp" style={{ fontSize: 16, marginTop: 14, lineHeight: 1.8 }}>「{photo.comment}」</div>
        <div style={{ marginTop: 8, fontSize: 10, letterSpacing: '0.18em', color: '#f3dec0' }}>POSTED {photo.time}</div>
      </div>
    </div>
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
