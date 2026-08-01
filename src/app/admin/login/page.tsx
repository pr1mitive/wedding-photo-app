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
    <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4">
      <AdminLoginForm nextPath={params.next} message={params.error ? messageMap[params.error] : undefined} />
    </main>
  );
}
