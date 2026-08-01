import GuestUploadForm from '@/components/guest/GuestUploadForm';

export default async function EventPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  return (
    <main className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="mx-auto mb-6 max-w-md text-center">
        <h1 className="text-2xl font-bold">Wedding Photo</h1>
        <p className="mt-2 text-sm text-slate-600">撮った写真をその場でシェアしてください</p>
      </div>
      <GuestUploadForm eventCode={eventCode} />
    </main>
  );
}
