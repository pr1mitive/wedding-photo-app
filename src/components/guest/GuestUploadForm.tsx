'use client';

import { useMemo, useState } from 'react';

type Props = {
  eventCode: string;
};

export default function GuestUploadForm({ eventCode }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [guestName, setGuestName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  const canSubmit = !!file && guestName.trim().length > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit || !file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('eventCode', eventCode);
    formData.append('guestName', guestName);
    formData.append('comment', comment);
    formData.append('clientUploadId', crypto.randomUUID());
    formData.append('file', file);

    try {
      const res = await fetch('/api/public/photos', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || '投稿に失敗しました');
      }

      window.location.href = `/e/${eventCode}/done`;
    } catch (e) {
      setError(e instanceof Error ? e.message : '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm">
      <div>
        <label className="mb-2 block text-sm font-medium">写真</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
      </div>

      {previewUrl && (
        <div className="overflow-hidden rounded-2xl border border-rose-100">
          <img src={previewUrl} alt="preview" className="h-auto w-full object-cover" />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">名前 / ニックネーム</label>
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          maxLength={30}
          className="w-full rounded-2xl border border-rose-200 px-3 py-2"
          placeholder="例: 山田"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">コメント</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={120}
          className="min-h-[96px] w-full rounded-2xl border border-rose-200 px-3 py-2"
          placeholder="例: おめでとう！"
        />
      </div>

      {error && <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? '投稿中...' : '投稿する'}
      </button>

      <p className="text-center text-xs text-slate-500">投稿後、会場モニターに表示されます</p>
    </div>
  );
}
