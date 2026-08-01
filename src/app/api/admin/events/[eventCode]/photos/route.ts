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
    .select('id, thumb_path, display_path, original_path, guest_name, comment, timeline_label, is_favorite, is_highlight, is_hidden, is_recommended, created_at')
    .eq('event_id', access.eventId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'FETCH_FAILED', message: 'failed' } }, { status: 500 });
  }

  const photoIds = (data || []).map((row) => row.id);
  const { data: reactions } = photoIds.length
    ? await supabaseAdmin
        .from('photo_reaction_counts')
        .select('photo_id, heart_count, clap_count, wow_count, cry_count, fire_count')
        .in('photo_id', photoIds)
    : { data: [] as any[] };

  const reactionMap = new Map(
    (reactions || []).map((row) => [
      row.photo_id,
      {
        heart: row.heart_count,
        clap: row.clap_count,
        wow: row.wow_count,
        cry: row.cry_count,
        fire: row.fire_count,
      },
    ]),
  );

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
        isRecommended: row.is_recommended,
        createdAt: row.created_at,
        reactions: reactionMap.get(row.id) || { heart: 0, clap: 0, wow: 0, cry: 0, fire: 0 },
      };
    }),
  );

  return NextResponse.json({ success: true, data: { photos } });
}
