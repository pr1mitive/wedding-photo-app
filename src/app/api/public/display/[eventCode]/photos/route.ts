import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;
  const orderType = req.nextUrl.searchParams.get('orderType') || 'chronological';
  const limit = Number(req.nextUrl.searchParams.get('limit') || '50');

  const { data: eventRow, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id')
    .eq('event_code', eventCode)
    .single();

  if (eventError || !eventRow) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'event not found' } }, { status: 404 });
  }

  let query = supabaseAdmin
    .from('photos')
    .select('id, display_path, guest_name, comment, created_at, is_highlight')
    .eq('event_id', eventRow.id)
    .eq('is_hidden', false)
    .limit(limit);

  query = orderType === 'newest' ? query.order('created_at', { ascending: false }) : query.order('created_at', { ascending: true });

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: { code: 'FETCH_FAILED', message: 'failed' } }, { status: 500 });
  }

  const photos = await Promise.all(
    (data || []).map(async (row) => {
      const signed = await supabaseAdmin.storage.from('wedding-display').createSignedUrl(row.display_path, 60 * 60);
      return {
        id: row.id,
        displayUrl: signed.data?.signedUrl ?? '',
        guestName: row.guest_name,
        comment: row.comment,
        createdAt: row.created_at,
        isHighlight: row.is_highlight,
      };
    }),
  );

  return NextResponse.json({ success: true, data: { photos } });
}
