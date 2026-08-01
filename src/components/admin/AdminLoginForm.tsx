'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Eyebrow, OrnamentDivider, SectionCard } from '@/components/shared/wedding-ui';

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
      setLoading(false);
      return;
    }

    window.location.href = nextPath || '/admin/wedding-test';
  };

  return (
    <SectionCard className="w-full max-w-md" style={{ padding: '34px 30px' }}>
      <Eyebrow>Admin Console</Eyebrow>
      <h1 className="title-jp" style={{ fontSize: 26, letterSpacing: '0.08em', marginTop: 8 }}>管理ログイン</h1>
      <div style={{ marginTop: 12 }}><OrnamentDivider wide={52} /></div>
      <p className="title-jp" style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-70)', lineHeight: 1.9 }}>
        管理画面に入るには、事前に作成した<br />
        管理者アカウントでログインしてください。
      </p>

      {message && <div style={{ marginTop: 18, background: '#fff7e8', border: '1px solid #eadbb2', padding: '10px 12px', fontSize: 12, color: '#7d6537' }}>{message}</div>}
      {error && <div style={{ marginTop: 18, background: '#fff1f1', border: '1px solid #f1cccc', padding: '10px 12px', fontSize: 12, color: '#8d3c3c' }}>{error}</div>}

      <div style={{ marginTop: 22, display: 'grid', gap: 18 }}>
        <label>
          <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-line"
            placeholder="admin@example.com"
          />
        </label>
        <label>
          <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-line"
            placeholder="••••••••"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading || !email || !password}
        className="btn-primary title-serif"
        style={{ width: '100%', marginTop: 28, opacity: loading || !email || !password ? 0.55 : 1 }}
      >
        {loading ? 'LOGGING IN…' : 'ログイン'}
      </button>
    </SectionCard>
  );
}
