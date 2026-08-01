import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  const messageMap: Record<string, string> = {
    forbidden: 'このイベントの管理権限がありません。',
    event_not_found: '対象イベントが見つかりません。',
  };

  return (
    <main className="wedding-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <AdminLoginForm nextPath={params.next} message={params.error ? messageMap[params.error] : undefined} />
    </main>
  );
}
