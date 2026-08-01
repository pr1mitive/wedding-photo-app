import AdminSettingsForm from '@/components/admin/AdminSettingsForm';

export default async function AdminSettingsPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  return (
    <main className="wedding-shell" style={{ minHeight: 'calc(100vh - 73px)' }}>
      <div className="wedding-container" style={{ padding: '28px 0 40px' }}>
        <AdminSettingsForm eventCode={eventCode} />
      </div>
    </main>
  );
}
