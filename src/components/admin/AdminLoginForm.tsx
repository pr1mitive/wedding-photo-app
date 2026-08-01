'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

type Props = {
  nextPath?: string;
  message?: string;
};

export default function AdminLoginForm({ nextPath, message }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
      setLoading(false);
      return;
    }

    window.location.href = nextPath || '/admin/wedding-test';
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">管理ログイン</h1>
      <p className="mt-2 text-sm text-slate-600">管理画面に入るには、事前に作成した管理者アカウントでログインしてください。</p>

      {message && <div className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{message}</div>}
      {error && <div className="mt-4 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-rose-200 px-3 py-2"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-rose-200 px-3 py-2"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading || !email || !password}
        className="mt-6 w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </div>
  );
}
