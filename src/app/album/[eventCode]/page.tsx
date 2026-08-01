import AlbumPageClient from '@/components/album/AlbumPageClient';

export default async function AlbumPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;
  return <AlbumPageClient eventCode={eventCode} />;
}
