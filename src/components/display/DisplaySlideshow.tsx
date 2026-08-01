'use client';

import { useEffect, useMemo, useState } from 'react';

type Photo = {
  id: string;
  displayUrl: string;
  guestName: string;
  comment: string | null;
  createdAt: string;
  isHighlight: boolean;
};

type Props = {
  eventCode: string;
};

export default function DisplaySlideshow({ eventCode }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const current = useMemo(() => photos[index] ?? null, [photos, index]);

  const fetchPhotos = async () => {
    const res = await fetch(`/api/public/display/${eventCode}/photos?limit=100&orderType=chronological`);
    const json = await res.json();
    if (json.success) setPhotos(json.data.photos);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
    const poll = setInterval(fetchPhotos, 10000);
    return () => clearInterval(poll);
  }, [eventCode]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white">読み込み中...</div>;

  if (!current) {
    return <div className="flex h-screen items-center justify-center bg-black text-white">写真の投稿をお待ちしています</div>;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <img src={current.displayUrl} alt={current.guestName} className="h-full w-full object-contain" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-8 text-white">
        <div className="text-2xl font-bold">{current.guestName}</div>
        {current.comment && <div className="mt-2 text-lg">{current.comment}</div>}
      </div>
    </div>
  );
}
