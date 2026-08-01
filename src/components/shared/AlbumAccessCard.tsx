'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type Props = {
  eventCode: string;
  title?: string;
  subtitle?: string;
  mode?: 'compact' | 'full';
};

export default function AlbumAccessCard({
  eventCode,
  title = 'アルバムを見る / リアクションする',
  subtitle = 'QRを読み取るとアルバムへ移動できます',
  mode = 'full',
}: Props) {
  const [albumUrl, setAlbumUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/album/${eventCode}`;
    setAlbumUrl(url);

    QRCode.toDataURL(url, {
      width: mode === 'compact' ? 132 : 184,
      margin: 1,
      color: {
        dark: '#2a2622',
        light: '#fbf9f4',
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [eventCode, mode]);

  return (
    <div
      className="wedding-card"
      style={{
        padding: mode === 'compact' ? '12px' : '18px',
        background: 'rgba(251,249,244,0.92)',
        backdropFilter: 'blur(4px)',
        border: '1px solid var(--hair)',
      }}
    >
      <div className="title-serif" style={{ fontSize: 11, letterSpacing: '0.22em', color: 'var(--gold)' }}>
        SHARE & REACT
      </div>
      <div className="title-jp" style={{ fontSize: mode === 'compact' ? 13 : 17, marginTop: 6, lineHeight: 1.6 }}>
        {title}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-70)', lineHeight: 1.7 }}>{subtitle}</div>

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          placeItems: 'center',
          background: '#fff',
          padding: mode === 'compact' ? '10px' : '14px',
          border: '1px solid var(--gold-soft)',
        }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="album qr"
            style={{ width: mode === 'compact' ? 132 : 184, height: mode === 'compact' ? 132 : 184, display: 'block' }}
          />
        ) : (
          <div style={{ width: mode === 'compact' ? 132 : 184, height: mode === 'compact' ? 132 : 184, display: 'grid', placeItems: 'center', color: 'var(--ink-50)', fontSize: 11 }}>
            QR生成中…
          </div>
        )}
      </div>

      <a
        href={albumUrl || `/album/${eventCode}`}
        target="_blank"
        rel="noreferrer"
        className="btn-secondary title-serif"
        style={{ display: 'block', textAlign: 'center', marginTop: 12, padding: mode === 'compact' ? '10px 12px' : undefined }}
      >
        アルバムを開く
      </a>

      {albumUrl && (
        <div style={{ marginTop: 8, fontSize: 9, color: 'var(--ink-30)', lineHeight: 1.6, wordBreak: 'break-all' }}>
          {albumUrl}
        </div>
      )}
    </div>
  );
}
