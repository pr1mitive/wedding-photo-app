'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eyebrow, OrnamentDivider, SectionCard, designPhotos } from '@/components/shared/wedding-ui';

type Props = {
  eventCode: string;
};

export default function GuestUploadForm({ eventCode }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [guestName, setGuestName] = useState('');
  const [nickname, setNickname] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const canSubmit = !!file && guestName.trim().length > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit || !file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('eventCode', eventCode);
    formData.append('guestName', nickname.trim() || guestName.trim());
    formData.append('comment', comment.trim());
    formData.append('clientUploadId', crypto.randomUUID());
    formData.append('file', file);

    try {
      const res = await fetch('/api/public/photos', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message || '投稿に失敗しました');
      window.location.href = `/e/${eventCode}/done`;
    } catch (e) {
      setError(e instanceof Error ? e.message : '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard className="mx-auto max-w-md overflow-hidden">
      <div className="border-b" style={{ borderColor: 'var(--hair-soft)', padding: '22px 24px 18px', textAlign: 'center' }}>
        <Eyebrow>Yuki &amp; Haruto&apos;s Wedding</Eyebrow>
        <h2 className="title-jp" style={{ fontSize: 24, fontWeight: 400, letterSpacing: '0.08em', marginTop: 8 }}>写真を送る</h2>
        <div style={{ marginTop: 10 }}><OrnamentDivider wide={44} /></div>
        <p style={{ marginTop: 10, color: 'var(--ink-50)', fontSize: 12, lineHeight: 1.8 }}>
          みなさまの視点で撮ってくださった一枚を<br />
          ふたりへ贈ってください
        </p>
      </div>

      <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--hair-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <StepBadge n={1} />
          <div className="title-jp" style={{ fontSize: 14, letterSpacing: '0.06em' }}>写真を選ぶ</div>
        </div>

        <div style={{ aspectRatio: '4 / 3', background: 'var(--paper)', border: '1px solid var(--hair)', overflow: 'hidden', position: 'relative' }}>
          {previewUrl ? (
            <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <img src={designPhotos[0]} alt="sample" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
          )}
          <div style={{ position: 'absolute', left: 10, top: 10, background: 'rgba(0,0,0,0.35)', color: '#fff', padding: '3px 8px', fontSize: 9, letterSpacing: '0.12em' }}>
            PREVIEW
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
          {designPhotos.slice(0, 3).map((src, i) => (
            <div key={src} style={{ aspectRatio: '1 / 1', border: '1px solid var(--hair)', overflow: 'hidden', position: 'relative' }}>
              <img src={src} alt={`sample-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
          <label style={{ aspectRatio: '1 / 1', border: '1px dashed var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, color: 'var(--gold)', cursor: 'pointer', background: 'rgba(245,239,230,0.45)' }}>
            <span style={{ fontSize: 18 }}>＋</span>
            <span style={{ fontSize: 9, letterSpacing: '0.16em' }}>ADD</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--hair-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <StepBadge n={2} />
          <div className="title-jp" style={{ fontSize: 14, letterSpacing: '0.06em' }}>お名前・ニックネーム</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="お名前" value={guestName} onChange={setGuestName} placeholder="山田 花子" />
          <Field label="ニックネーム" value={nickname} onChange={setNickname} placeholder="はなこ" />
        </div>
        <p style={{ marginTop: 8, fontSize: 10, color: 'var(--ink-50)' }}>モニターでは「ニックネーム」が表示されます</p>
      </div>

      <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--hair-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <StepBadge n={3} />
          <div className="title-jp" style={{ fontSize: 14, letterSpacing: '0.06em' }}>ひとことコメント</div>
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 120))}
            placeholder="この写真に添えたい想いを…"
            style={{ width: '100%', minHeight: 98, border: '1px solid var(--hair)', background: 'var(--paper)', padding: '12px 14px 24px', resize: 'none', outline: 'none', lineHeight: 1.8, color: 'var(--ink)' }}
          />
          <div style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 10, color: 'var(--ink-30)' }}>{comment.length} / 120</div>
        </div>
      </div>

      <div style={{ padding: '16px 24px 20px' }}>
        {error && <div style={{ marginBottom: 14, background: '#fff1f1', border: '1px solid #f1cccc', padding: '10px 12px', fontSize: 12, color: '#8d3c3c' }}>{error}</div>}

        <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="btn-primary title-serif" style={{ width: '100%', opacity: canSubmit ? 1 : 0.55 }}>
          {loading ? 'POSTING…' : 'ふたりに贈る'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 10, lineHeight: 1.8, color: 'var(--ink-50)' }}>
          投稿された写真は披露宴中のモニターに映し出され、<br />
          後日アルバムページからもご覧いただけます
        </p>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <OrnamentDivider wide={32} />
          <div className="title-serif" style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-30)', fontStyle: 'italic' }}>— 2026.10.18 —</div>
        </div>
      </div>
    </SectionCard>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="title-serif" style={{ width: 22, height: 22, borderRadius: 999, border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 12 }}>
      {n}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label>
      <div className="eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field-line title-jp" style={{ fontSize: 14 }} />
    </label>
  );
}
