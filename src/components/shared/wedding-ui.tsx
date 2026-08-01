import type { CSSProperties, ReactNode } from 'react';

export function OrnamentDivider({ wide = 56, light = false }: { wide?: number; light?: boolean }) {
  const line = light ? 'rgba(220,196,143,0.7)' : 'var(--gold)';
  return (
    <div className="ornament" aria-hidden="true">
      <span style={{ width: wide / 2, height: 1, background: line, display: 'inline-block' }} />
      <span
        className="ornament-diamond"
        style={{ background: line }}
      />
      <span style={{ width: wide / 2, height: 1, background: line, display: 'inline-block' }} />
    </div>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow ${className}`.trim()}>{children}</div>;
}

export function SectionCard({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`wedding-card ${className}`.trim()} style={style}>{children}</div>;
}

export const designPhotos = [
  '/design/07-bride-bouquet.jpg',
  '/design/14-golden-hour.jpg',
  '/design/03-garden-wedding.jpg',
  '/design/01-ceremony-aisle.jpg',
  '/design/15-first-dance.jpg',
  '/design/13-cake-gold.jpg',
  '/design/16-rings-hands.jpg',
  '/design/18-pastel-decor.jpg',
];

export const designPosts = [
  { src: '/design/07-bride-bouquet.jpg', guestName: 'Mika', comment: '花嫁さんが本当に綺麗でした', time: '17:12', highlight: true },
  { src: '/design/14-golden-hour.jpg', guestName: 'Rina', comment: '夕暮れの光がとても素敵でした', time: '17:24', highlight: false },
  { src: '/design/03-garden-wedding.jpg', guestName: 'Daichi', comment: 'ガーデンの空気まで残したい一枚です', time: '17:31', highlight: false },
  { src: '/design/15-first-dance.jpg', guestName: 'Yui', comment: '会場がいちばん温かくなった瞬間', time: '18:04', highlight: true },
  { src: '/design/13-cake-gold.jpg', guestName: 'Kana', comment: 'ケーキ入刀の歓声が忘れられません', time: '18:15', highlight: false },
  { src: '/design/16-rings-hands.jpg', guestName: 'Sota', comment: '指輪交換の手元が綺麗でした', time: '18:28', highlight: false },
];
