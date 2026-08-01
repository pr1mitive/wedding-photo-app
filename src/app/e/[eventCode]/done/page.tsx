export default async function DonePage({ params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-sm">
        <div className="mb-3 text-4xl">🎉</div>
        <h1 className="text-xl font-bold">投稿ありがとうございました</h1>
        <p className="mt-2 text-sm text-slate-600">まもなく会場モニターに表示されます</p>
        <a href={`/e/${eventCode}`} className="mt-6 inline-block rounded-2xl bg-gold px-4 py-3 font-semibold text-white">
          もう1枚投稿する
        </a>
      </div>
    </main>
  );
}
