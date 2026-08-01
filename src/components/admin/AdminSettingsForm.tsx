'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Eyebrow, OrnamentDivider } from '@/components/shared/wedding-ui';

type Props = {
  eventCode: string;
};

type FormState = {
  slideIntervalSec: number;
  focusDurationSec: number;
  transitionType: 'fade' | 'zoom' | 'slide';
  orderType: 'chronological' | 'newest' | 'random';
  showComment: boolean;
  highlightPriority: boolean;
  albumPublicUntil: string;
  isActive: boolean;
  currentMissionTitle: string;
  currentMissionDescription: string;
  currentMissionActive: boolean;
  autoHighlightEnabled: boolean;
  autoHighlightIntervalSec: number;
};

const defaultState: FormState = {
  slideIntervalSec: 5,
  focusDurationSec: 5,
  transitionType: 'fade',
  orderType: 'chronological',
  showComment: true,
  highlightPriority: true,
  albumPublicUntil: '',
  isActive: true,
  currentMissionTitle: '',
  currentMissionDescription: '',
  currentMissionActive: false,
  autoHighlightEnabled: false,
  autoHighlightIntervalSec: 20,
};

export default function AdminSettingsForm({ eventCode }: Props) {
  const [form, setForm] = useState<FormState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch(`/api/public/display/${eventCode}/settings`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setForm({
          slideIntervalSec: json.data.settings.slideIntervalSec ?? 5,
          focusDurationSec: json.data.settings.focusDurationSec ?? 5,
          transitionType: json.data.settings.transitionType ?? 'fade',
          orderType: json.data.settings.orderType ?? 'chronological',
          showComment: json.data.settings.showComment ?? true,
          highlightPriority: json.data.settings.highlightPriority ?? true,
          albumPublicUntil: json.data.albumPublicUntil ? String(json.data.albumPublicUntil).slice(0, 16) : '',
          isActive: json.data.isActive ?? true,
          currentMissionTitle: json.data.settings.currentMissionTitle ?? '',
          currentMissionDescription: json.data.settings.currentMissionDescription ?? '',
          currentMissionActive: json.data.settings.currentMissionActive ?? false,
          autoHighlightEnabled: json.data.settings.autoHighlightEnabled ?? false,
          autoHighlightIntervalSec: json.data.settings.autoHighlightIntervalSec ?? 20,
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, [eventCode]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/events/${eventCode}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          currentMissionTitle: form.currentMissionTitle.trim() || null,
          currentMissionDescription: form.currentMissionDescription.trim() || null,
          albumPublicUntil: form.albumPublicUntil ? new Date(form.albumPublicUntil).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message || '保存に失敗しました');
      setMessage('設定を保存しました');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="wedding-card" style={{ padding: 24 }}>読み込み中…</div>;
  }

  return (
    <div className="wedding-card" style={{ padding: 24 }}>
      <Eyebrow>Display Settings</Eyebrow>
      <div className="title-jp" style={{ fontSize: 24, marginTop: 8 }}>モニター・演出・公開設定</div>
      <div style={{ marginTop: 12 }}><OrnamentDivider wide={68} /></div>

      <div style={{ marginTop: 24, display: 'grid', gap: 26 }}>
        <section>
          <div className="eyebrow" style={{ fontSize: 9 }}>Monitor Basics</div>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 16 }}>
            <Field label="背景スピード(秒)">
              <input type="number" min={2} max={15} value={form.slideIntervalSec} onChange={(e) => setForm((s) => ({ ...s, slideIntervalSec: Number(e.target.value) }))} className="field-line" />
            </Field>
            <Field label="新着アップ表示(秒)">
              <input type="number" min={3} max={10} value={form.focusDurationSec} onChange={(e) => setForm((s) => ({ ...s, focusDurationSec: Number(e.target.value) }))} className="field-line" />
            </Field>
            <Field label="背景並び順">
              <select value={form.orderType} onChange={(e) => setForm((s) => ({ ...s, orderType: e.target.value as FormState['orderType'] }))} className="field-line">
                <option value="chronological">古い順</option>
                <option value="newest">新しい順</option>
                <option value="random">ランダム</option>
              </select>
            </Field>
            <Field label="切替演出">
              <select value={form.transitionType} onChange={(e) => setForm((s) => ({ ...s, transitionType: e.target.value as FormState['transitionType'] }))} className="field-line">
                <option value="fade">フェード</option>
                <option value="zoom">ズーム</option>
                <option value="slide">スライド</option>
              </select>
            </Field>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            <Toggle label="コメントをモニター表示する" checked={form.showComment} onChange={(checked) => setForm((s) => ({ ...s, showComment: checked }))} />
            <Toggle label="新着投稿を優先して大表示する" checked={form.highlightPriority} onChange={(checked) => setForm((s) => ({ ...s, highlightPriority: checked }))} />
          </div>
        </section>

        <section>
          <div className="eyebrow" style={{ fontSize: 9 }}>Mission</div>
          <div className="title-jp" style={{ fontSize: 16, marginTop: 6 }}>お題ミッション</div>
          <div style={{ marginTop: 14, display: 'grid', gap: 16 }}>
            <Field label="ミッションタイトル">
              <input value={form.currentMissionTitle} maxLength={50} onChange={(e) => setForm((s) => ({ ...s, currentMissionTitle: e.target.value.slice(0, 50) }))} className="field-line title-jp" placeholder="例: 乾杯の笑顔を集めよう" />
            </Field>
            <Field label="ミッション説明">
              <textarea value={form.currentMissionDescription} maxLength={160} onChange={(e) => setForm((s) => ({ ...s, currentMissionDescription: e.target.value.slice(0, 160) }))} style={{ width: '100%', minHeight: 96, border: '1px solid var(--hair)', background: 'rgba(251,249,244,0.7)', padding: '12px 14px', resize: 'vertical', color: 'var(--ink)', outline: 'none', lineHeight: 1.8 }} placeholder="例: 今この瞬間の拍手やテーブルの笑顔をぜひ投稿してください。" />
            </Field>
            <Toggle label="ミッションをゲスト画面とモニターに表示する" checked={form.currentMissionActive} onChange={(checked) => setForm((s) => ({ ...s, currentMissionActive: checked }))} />
          </div>
        </section>

        <section>
          <div className="eyebrow" style={{ fontSize: 9 }}>Highlight Replay</div>
          <div className="title-jp" style={{ fontSize: 16, marginTop: 6 }}>終盤ハイライト自動再生</div>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 16 }}>
            <Field label="自動再生間隔(秒)">
              <input type="number" min={10} max={120} value={form.autoHighlightIntervalSec} onChange={(e) => setForm((s) => ({ ...s, autoHighlightIntervalSec: Number(e.target.value) }))} className="field-line" />
            </Field>
            <Field label="投稿受付">
              <select value={String(form.isActive)} onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.value === 'true' }))} className="field-line">
                <option value="true">受付中</option>
                <option value="false">停止</option>
              </select>
            </Field>
            <Field label="アルバム公開期限">
              <input type="datetime-local" value={form.albumPublicUntil} onChange={(e) => setForm((s) => ({ ...s, albumPublicUntil: e.target.value }))} className="field-line" />
            </Field>
            <div />
          </div>
          <div style={{ marginTop: 18 }}>
            <Toggle label="ハイライト写真を一定間隔で自動再生する" checked={form.autoHighlightEnabled} onChange={(checked) => setForm((s) => ({ ...s, autoHighlightEnabled: checked }))} />
          </div>
        </section>
      </div>

      <button type="button" className="btn-primary title-serif" style={{ marginTop: 24, width: '100%' }} onClick={save} disabled={saving}>
        {saving ? 'SAVING…' : '設定を保存する'}
      </button>
      {message && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--gold)' }}>{message}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ border: '1px solid var(--hair)', background: checked ? 'rgba(243,228,225,0.55)' : 'rgba(251,249,244,0.8)', padding: '12px 14px', textAlign: 'left', cursor: 'pointer' }}>
      <div className="title-jp" style={{ fontSize: 13 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 10, color: checked ? 'var(--gold)' : 'var(--ink-50)' }}>{checked ? 'ON' : 'OFF'}</div>
    </button>
  );
}
