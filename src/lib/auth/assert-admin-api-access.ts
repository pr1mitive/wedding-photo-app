import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function assertAdminApiAccess(eventCode: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      body: { success: false, error: { code: 'UNAUTHORIZED', message: 'login required' } },
    };
  }

  const { data: eventRow, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('event_code', eventCode)
    .single();

  if (eventError || !eventRow) {
    return {
      ok: false as const,
      status: 404,
      body: { success: false, error: { code: 'NOT_FOUND', message: 'event not found' } },
    };
  }

  const { data: adminRow } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('event_id', eventRow.id)
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    return {
      ok: false as const,
      status: 403,
      body: { success: false, error: { code: 'FORBIDDEN', message: 'admin access required' } },
    };
  }

  return {
    ok: true as const,
    user,
    eventId: eventRow.id,
  };
}
