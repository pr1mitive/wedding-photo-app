'use client';

import { useEffect, useState } from 'react';

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
  const [selected, setSelected] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      const res = await fetch(`/api/admin/events/${eventCode}/photos`);
      const json = await res.json();
      if (json.success) {
        setPhotos(json.data.photos);
        setSelected(json.data.photos[0] ?? null);
      }
    };
    fetchPhotos();
  }, [eventCode]);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[380px_1fr]">
      <aside className="border-r border-rose-100 bg-white p-4">
        <h1 className="mb-4 text-lg font-bold">投稿一覧</h1>
        <div className="space-y-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelected(photo)}
              className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 p-2 text-left hover:bg-rose-50"
            >
              <img src={photo.thumbUrl} alt={photo.guestName} className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0">
                <div className="truncate font-medium">{photo.guestName}</div>
                <div className="truncate text-sm text-slate-500">{photo.comment}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="p-6">
        {!selected ? (
          <div>写真を選択してください</div>
        ) : (
          <div className="space-y-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
            <img src={selected.displayUrl} alt={selected.guestName} className="max-h-[70vh] rounded-3xl border border-rose-100" />
            <div>
              <div className="text-xl font-bold">{selected.guestName}</div>
              <div className="mt-2 text-slate-700">{selected.comment}</div>
              <div className="mt-2 text-sm text-slate-500">{selected.timelineLabel || '未設定'}</div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-2xl border border-rose-200 px-4 py-2">お気に入り</button>
              <button className="rounded-2xl border border-rose-200 px-4 py-2">アップ表示</button>
              <button className="rounded-2xl border border-rose-200 px-4 py-2">非表示</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
