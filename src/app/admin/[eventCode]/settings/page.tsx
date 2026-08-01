export default async function AdminSettingsPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">表示設定</h1>
        <p className="mt-2 text-sm text-slate-600">イベントコード: {eventCode}</p>
        <p className="mt-4 text-sm text-slate-600">このページは拡張用のプレースホルダーです。</p>
      </div>
    </main>
  );
}
