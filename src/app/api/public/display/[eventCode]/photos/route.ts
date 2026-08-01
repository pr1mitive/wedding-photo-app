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
    .select('id, display_path, guest_name, comment, created_at, is_highlight, is_recommended, width, height')
    .eq('event_id', eventRow.id)
    .eq('is_hidden', false)
    .limit(limit);

  if (orderType === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: { code: 'FETCH_FAILED', message: 'failed' } }, { status: 500 });
  }

  const rows = orderType === 'random' ? [...(data || [])].sort(() => Math.random() - 0.5) : data || [];
  const photoIds = rows.map((row) => row.id);
  const reactionResult = photoIds.length
    ? await supabaseAdmin
        .from('photo_reaction_counts')
        .select('photo_id, heart_count, clap_count, wow_count, cry_count, fire_count, total_count')
        .in('photo_id', photoIds)
    : { data: [] as any[] };

  const reactionMap = new Map(
    (reactionResult.data || []).map((row) => [
      row.photo_id,
      {
        heart: row.heart_count ?? 0,
        clap: row.clap_count ?? 0,
        wow: row.wow_count ?? 0,
        cry: row.cry_count ?? 0,
        fire: row.fire_count ?? 0,
        total: row.total_count ?? 0,
      },
    ]),
  );

  const photos = await Promise.all(
    rows.map(async (row) => {
      const signed = await supabaseAdmin.storage.from('wedding-display').createSignedUrl(row.display_path, 60 * 60);
      return {
        id: row.id,
        displayUrl: signed.data?.signedUrl ?? '',
        guestName: row.guest_name,
        comment: row.comment,
        createdAt: row.created_at,
        isHighlight: row.is_highlight,
        isRecommended: row.is_recommended,
        width: row.width,
        height: row.height,
        reactions: reactionMap.get(row.id) || { heart: 0, clap: 0, wow: 0, cry: 0, fire: 0, total: 0 },
      };
    }),
  );

  return NextResponse.json({ success: true, data: { photos } });
}
