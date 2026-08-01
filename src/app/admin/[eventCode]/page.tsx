import AdminPhotoList from '@/components/admin/AdminPhotoList';

export default async function AdminEventPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;
  return <AdminPhotoList eventCode={eventCode} />;
}
