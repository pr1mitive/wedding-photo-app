'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

type Photo = {
  id: string;
  displayUrl: string;
  guestName: string;
  comment: string | null;
  createdAt: string;
  isHighlight: boolean;
};

type DisplaySettings = {
  slideIntervalSec: number;
  focusDurationSec: number;
  transitionType: 'fade' | 'zoom' | 'slide';
  orderType: 'chronological' | 'newest' | 'random';
  showComment: boolean;
  highlightPriority: boolean;
};

type Props = {
  eventCode: string;
};

const DEFAULT_SETTINGS: DisplaySettings = {
  slideIntervalSec: 5,
  focusDurationSec: 5,
  transitionType: 'fade',
  orderType: 'chronological',
  showComment: true,
  highlightPriority: true,
};

const COLUMN_COUNT = 5;

export default function DisplaySlideshow({ eventCode }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [focusPhoto, setFocusPhoto] = useState<Photo | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedRef = useRef(false);

  const latestPhoto = useMemo(() => {
    return [...photos].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0] ?? null;
  }, [photos]);

  const stamp = latestPhoto
    ? new Date(latestPhoto.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const collageColumns = useMemo(() => {
    if (!photos.length) return [] as Photo[][];

    const repeated = Array.from({ length: Math.max(COLUMN_COUNT * 6, photos.length * 3) }, (_, i) => photos[i % photos.length]);
    return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => repeated.filter((_, idx) => idx % COLUMN_COUNT === columnIndex));
  }, [photos]);

  const fetchSettings = async () => {
    const res = await fetch(`/api/public/display/${eventCode}/settings`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success?.valueOf()) {
      setSettings({ ...DEFAULT_SETTINGS, ...json.data.settings });
    }
  };

  const fetchPhotos = async (orderType: DisplaySettings['orderType']) => {
    const res = await fetch(`/api/public/display/${eventCode}/photos?limit=120&orderType=${orderType}`, { cache: 'no-store' });
    const json = await res.json();
    if (!json.success) {
      setLoading(false);
      return;
    }

    const nextPhotos: Photo[] = json.data.photos ?? [];

    if (hasLoadedRef.current) {
      const newItems = nextPhotos
        .filter((photo) => !knownIdsRef.current.has(photo.id))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

      if (newItems[0]) {
        setFocusPhoto(newItems[0]);
      }
    } else {
      hasLoadedRef.current = true;
    }

    knownIdsRef.current = new Set(nextPhotos.map((photo) => photo.id));
    setPhotos(nextPhotos);
    setLoading(false);
  };

  useEffect(() => {
    const initialize = async () => {
      const settingsRes = await fetch(`/api/public/display/${eventCode}/settings`, { cache: 'no-store' });
      const settingsJson = await settingsRes.json();
      const nextSettings = settingsJson.success ? { ...DEFAULT_SETTINGS, ...settingsJson.data.settings } : DEFAULT_SETTINGS;
      setSettings(nextSettings);
      await fetchPhotos(nextSettings.orderType);
    };

    initialize();
    const poll = setInterval(() => {
      fetchPhotos(settings.orderType);
    }, 6000);
    const settingsPoll = setInterval(fetchSettings, 20000);
    return () => {
      clearInterval(poll);
      clearInterval(settingsPoll);
    };
  }, [eventCode, settings.orderType]);

  useEffect(() => {
    if (!focusPhoto) return;
    const timer = setTimeout(() => setFocusPhoto(null), settings.focusDurationSec * 1000);
    return () => clearTimeout(timer);
  }, [focusPhoto, settings.focusDurationSec]);

  if (loading) {
    return <MonitorMessage message="写真を読み込んでいます" sub="会場モニターの準備中です" />;
  }

  if (!photos.length) {
    return <MonitorMessage message="写真の投稿をお待ちしています" sub="最初の一枚が届くと、背景に流れはじめます" />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(120% 100% at 50% 30%, var(--ivory) 0%, var(--paper) 100%)',
        color: 'var(--ink)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes monitor-scroll-up {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes monitor-scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        @keyframes focus-fade-in {
          0% { opacity: 0; transform: translateY(16px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 1100px) {
          .monitor-collage { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 820px) {
          .monitor-collage { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(251,249,244,0.82) 0%, rgba(245,239,230,0.44) 22%, rgba(245,239,230,0.34) 78%, rgba(251,249,244,0.9) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 2, padding: '28px 44px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
        <div>
          <Eyebrow>Live Photo Stream</Eyebrow>
          <h1 className="title-jp" style={{ fontSize: 24, fontWeight: 400, letterSpacing: '0.1em', marginTop: 6 }}>みんなの写真が背景に流れています</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="title-serif" style={{ color: 'var(--gold)', letterSpacing: '0.28em', fontSize: 12 }}>WATARU &amp; MISAKI</div>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-50)', marginTop: 4 }}>NEW POST FOCUS · {settings.focusDurationSec} SEC</div>
        </div>
      </div>

      <div
        className="monitor-collage"
        style={{
          position: 'absolute',
          inset: '88px 30px 92px',
          zIndex: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${COLUMN_COUNT}, 1fr)`,
          gap: 18,
          alignItems: 'stretch',
          overflow: 'hidden',
        }}
      >
        {collageColumns.map((column, columnIndex) => {
          const duration = settings.slideIntervalSec * 5 + columnIndex * 3;
          const animationName = columnIndex % 2 === 0 ? 'monitor-scroll-up' : 'monitor-scroll-down';
          const tileHeight = columnIndex % 3 === 0 ? '160px' : columnIndex % 3 === 1 ? '190px' : '145px';
          const duplicated = [...column, ...column];

          return (
            <div key={columnIndex} style={{ position: 'relative', overflow: 'hidden', maskImage: 'linear-gradient(180deg, transparent 0%, black 8%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: `${animationName} ${duration}s linear infinite` }}>
                {duplicated.map((photo, photoIndex) => (
                  <div
                    key={`${columnIndex}-${photo.id}-${photoIndex}`}
                    style={{
                      position: 'relative',
                      height: tileHeight,
                      overflow: 'hidden',
                      border: '1px solid rgba(184,151,92,0.42)',
                      background: 'rgba(255,255,255,0.58)',
                      boxShadow: '0 18px 36px -30px rgba(42,38,34,0.35)',
                    }}
                  >
                    <img src={photo.displayUrl} alt={photo.guestName} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: focusPhoto ? 'saturate(0.9) brightness(0.88)' : 'saturate(0.95) brightness(0.94)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(20,16,12,0.42))' }} />
                    <div style={{ position: 'absolute', left: 10, bottom: 10, right: 10, color: '#fff' }}>
                      <div className="title-serif" style={{ fontSize: 10, letterSpacing: '0.18em', color: '#f3dec0' }}>{photo.isHighlight ? 'HIGHLIGHT' : 'MEMORY'}</div>
                      <div className="title-jp" style={{ marginTop: 2, fontSize: 11, lineHeight: 1.5 }}>{photo.guestName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {focusPhoto && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '110px 56px 96px', background: 'rgba(255,249,242,0.18)', backdropFilter: 'blur(3px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '100%', animation: 'focus-fade-in 0.5s ease forwards' }}>
            <div className="title-serif" style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--gold)', letterSpacing: '0.32em', marginBottom: 12 }}>
              ◇ NEW POST ◇
            </div>

            <div className="surface-frame" style={{ position: 'relative', boxShadow: '0 24px 70px -20px rgba(42,38,34,0.38)', background: 'rgba(255,255,255,0.95)' }}>
              <div className="surface-frame__inner">
                <img
                  src={focusPhoto.displayUrl}
                  alt={focusPhoto.guestName}
                  style={{
                    display: 'block',
                    width: 'min(42vw, 640px)',
                    height: 'min(42vw, 640px)',
                    minWidth: 320,
                    minHeight: 320,
                    maxWidth: '74vw',
                    maxHeight: '72vh',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <DiamondCorner top left />
              <DiamondCorner top />
              <DiamondCorner left bottom />
              <DiamondCorner bottom />
            </div>

            <div style={{ marginTop: 22, textAlign: 'center', maxWidth: 600 }}>
              <OrnamentDivider wide={64} />
              {settings.showComment && focusPhoto.comment && (
                <div className="title-jp" style={{ fontSize: 18, lineHeight: 1.75, letterSpacing: '0.05em', marginTop: 14 }}>
                  「{focusPhoto.comment}」
                </div>
              )}
              <div className="title-serif" style={{ marginTop: 10, fontStyle: 'italic', fontSize: 14, letterSpacing: '0.18em', color: 'var(--gold)' }}>
                — from {focusPhoto.guestName} —
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4, padding: '18px 42px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, background: 'linear-gradient(180deg, transparent 0%, rgba(251,249,244,0.86) 42%, rgba(251,249,244,0.96) 100%)' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: Math.min(8, photos.length) }).map((_, i) => (
            <div key={i} style={{ width: i === 0 ? 24 : 8, height: 2, background: i === 0 ? 'var(--gold)' : 'var(--hair)' }} />
          ))}
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--ink-50)' }}>
          投稿 {String(photos.length).padStart(2, '0')} 枚 · LAST UPDATE {stamp}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: 'var(--ink-50)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
            LIVE
          </span>
          <span>{focusPhoto ? '新着を拡大表示中' : '背景コラージュ表示中'}</span>
        </div>
      </div>
    </div>
  );
}

function MonitorMessage({ message, sub }: { message: string; sub: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 30%, var(--ivory) 0%, var(--paper) 100%)', color: 'var(--ink)' }}>
      <div style={{ textAlign: 'center' }}>
        <Eyebrow>Live Photo Stream</Eyebrow>
        <div className="title-jp" style={{ fontSize: 26, marginTop: 10 }}>{message}</div>
        <div style={{ marginTop: 12 }}><OrnamentDivider wide={52} /></div>
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-50)' }}>{sub}</p>
      </div>
    </div>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const style: CSSProperties = { position: 'absolute', width: 90, height: 90, pointerEvents: 'none', zIndex: 5 };
  if (pos === 'tl') {
    style.top = 18;
    style.left = 18;
  } else if (pos === 'tr') {
    style.top = 18;
    style.right = 18;
  } else if (pos === 'bl') {
    style.bottom = 18;
    style.left = 18;
  } else {
    style.bottom = 18;
    style.right = 18;
  }

  const flipX = pos.endsWith('r') ? -1 : 1;
  const flipY = pos.startsWith('b') ? -1 : 1;

  return (
    <svg style={style} viewBox="0 0 90 90">
      <g transform={`translate(${flipX === -1 ? 90 : 0}, ${flipY === -1 ? 90 : 0}) scale(${flipX}, ${flipY})`} stroke="var(--gold)" strokeWidth="0.7" fill="none">
        <path d="M0,50 L0,0 L50,0" />
        <path d="M10,20 Q20,10 30,10 M15,25 Q25,15 35,15" opacity="0.6" />
        <circle cx="8" cy="8" r="1.5" fill="var(--gold)" />
        <circle cx="30" cy="30" r="1.2" fill="var(--gold)" />
        <path d="M6,40 L14,40 M40,6 L40,14" opacity="0.5" />
      </g>
    </svg>
  );
}

function DiamondCorner({ top, left, bottom }: { top?: boolean; left?: boolean; bottom?: boolean }) {
  const style: CSSProperties = {
    position: 'absolute',
    width: 6,
    height: 6,
    background: 'var(--gold)',
    transform: 'rotate(45deg)',
  };
  if (top) style.top = -3;
  if (bottom) style.bottom = -3;
  if (left) style.left = -3;
  if (!left) style.right = -3;
  return <span style={style} />;
}
