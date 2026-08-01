import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_: Request, { params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  const { data: eventRow, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, title, event_code, album_public_until')
    .eq('event_code', eventCode)
    .single();

  if (eventError || !eventRow) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'event not found' } }, { status: 404 });
  }

  if (eventRow.album_public_until && new Date(eventRow.album_public_until).getTime() < Date.now()) {
    return NextResponse.json(
      { success: false, error: { code: 'ALBUM_CLOSED', message: 'album closed' } },
      { status: 403 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('photos')
    .select('id, display_path, original_path, guest_name, comment, timeline_label, is_favorite, is_highlight, created_at')
    .eq('event_id', eventRow.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'FETCH_FAILED', message: 'photos fetch failed' } }, { status: 500 });
  }

  const photos = await Promise.all(
    (data || []).map(async (row) => {
      const [displaySigned, originalSigned] = await Promise.all([
        supabaseAdmin.storage.from('wedding-display').createSignedUrl(row.display_path, 60 * 60),
        supabaseAdmin.storage.from('wedding-originals').createSignedUrl(row.original_path, 60 * 60),
      ]);

      return {
        id: row.id,
        src: displaySigned.data?.signedUrl ?? '',
        originalUrl: originalSigned.data?.signedUrl ?? '',
        guestName: row.guest_name,
        comment: row.comment || '',
        timelineLabel: row.timeline_label,
        isFavorite: row.is_favorite,
        isHighlight: row.is_highlight,
        createdAt: row.created_at,
      };
    }),
  );

  return NextResponse.json({
    success: true,
    data: {
      eventTitle: eventRow.title,
      eventCode: eventRow.event_code,
      albumPublicUntil: eventRow.album_public_until,
      photos,
    },
  });
}
