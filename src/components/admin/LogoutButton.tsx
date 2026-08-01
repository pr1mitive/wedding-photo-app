'use client';

import { createClient } from '@/lib/supabase/browser';

export default function LogoutButton() {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-2xl border border-rose-200 px-4 py-2 text-sm hover:bg-rose-50"
    >
      ログアウト
    </button>
  );
}
