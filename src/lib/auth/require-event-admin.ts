import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function requireEventAdmin(eventCode: string) {
  const user = await requireAdmin();

  const { data: eventRow, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, title, event_code')
    .eq('event_code', eventCode)
    .single();

  if (eventError || !eventRow) {
    redirect('/admin/login?error=event_not_found');
  }

  const { data: adminRow } = await supabaseAdmin
    .from('admin_users')
    .select('id, display_name')
    .eq('event_id', eventRow.id)
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect('/admin/login?error=forbidden');
  }

  return {
    user,
    adminRow,
    event: eventRow,
  };
}
