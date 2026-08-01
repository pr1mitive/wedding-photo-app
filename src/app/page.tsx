export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Wedding Photo App</h1>
        <p className="mt-4 text-slate-600">
          結婚式向けのリアルタイム写真共有Webアプリのスターターです。
        </p>
        <div className="mt-8 space-y-2 text-sm text-slate-700">
          <p>ゲスト投稿: /e/wedding-test</p>
          <p>モニター: /e/wedding-test/display</p>
          <p>管理画面: /admin/wedding-test</p>
          <p>後日アルバム: /album/wedding-test</p>
        </div>
      </div>
    </main>
  );
}
