import Link from 'next/link';
import LogoutButton from '@/components/admin/LogoutButton';
import { requireEventAdmin } from '@/lib/auth/require-event-admin';

export default async function AdminEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventCode: string }>;
}) {
  const { eventCode } = await params;
  const { user, adminRow, event } = await requireEventAdmin(eventCode);

  return (
    <div className="min-h-screen bg-rose-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="text-xs text-slate-500">管理画面</div>
            <div className="text-lg font-bold">{event.title}</div>
            <div className="text-xs text-slate-500">{adminRow.display_name} / {user.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/${event.event_code}`} className="rounded-2xl border border-rose-200 px-4 py-2 text-sm hover:bg-rose-50">
              投稿一覧
            </Link>
            <Link href={`/admin/${event.event_code}/settings`} className="rounded-2xl border border-rose-200 px-4 py-2 text-sm hover:bg-rose-50">
              表示設定
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
