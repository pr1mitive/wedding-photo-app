import { NextResponse } from 'next/server';
import { assertAdminApiAccess } from '@/lib/auth/assert-admin-api-access';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_: Request, { params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  const access = await assertAdminApiAccess(eventCode);
  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status });
  }

  const { data, error } = await supabaseAdmin
    .from('photos')
    .select('id, thumb_path, display_path, original_path, guest_name, comment, timeline_label, is_favorite, is_highlight, is_hidden, created_at')
    .eq('event_id', access.eventId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'FETCH_FAILED', message: 'failed' } }, { status: 500 });
  }

  const photos = await Promise.all(
    (data || []).map(async (row) => {
      const [thumbSigned, displaySigned, originalSigned] = await Promise.all([
        supabaseAdmin.storage.from('wedding-thumbs').createSignedUrl(row.thumb_path, 60 * 60),
        supabaseAdmin.storage.from('wedding-display').createSignedUrl(row.display_path, 60 * 60),
        supabaseAdmin.storage.from('wedding-originals').createSignedUrl(row.original_path, 60 * 60),
      ]);

      return {
        id: row.id,
        thumbUrl: thumbSigned.data?.signedUrl ?? '',
        displayUrl: displaySigned.data?.signedUrl ?? '',
        originalUrl: originalSigned.data?.signedUrl ?? '',
        guestName: row.guest_name,
        comment: row.comment,
        timelineLabel: row.timeline_label,
        isFavorite: row.is_favorite,
        isHighlight: row.is_highlight,
        isHidden: row.is_hidden,
        createdAt: row.created_at,
      };
    }),
  );

  return NextResponse.json({ success: true, data: { photos } });
}
