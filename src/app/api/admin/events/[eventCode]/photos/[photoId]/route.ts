import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApiAccess } from '@/lib/auth/assert-admin-api-access';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { patchPhotoSchema } from '@/lib/validators/photo';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventCode: string; photoId: string }> },
) {
  const { eventCode, photoId } = await params;

  const access = await assertAdminApiAccess(eventCode);
  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchPhotoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'invalid payload' } },
      { status: 400 },
    );
  }

  const payload = Object.fromEntries(
    Object.entries({
      is_favorite: parsed.data.isFavorite,
      is_highlight: parsed.data.isHighlight,
      is_hidden: parsed.data.isHidden,
      is_recommended: parsed.data.isRecommended,
      timeline_label: parsed.data.timelineLabel,
    }).filter(([, value]) => value !== undefined),
  );

  if (!Object.keys(payload).length) {
    return NextResponse.json(
      { success: false, error: { code: 'EMPTY_UPDATE', message: '更新内容がありません' } },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('photos')
    .update(payload)
    .eq('event_id', access.eventId)
    .eq('id', photoId)
    .select('id, thumb_path, display_path, original_path, guest_name, comment, timeline_label, is_favorite, is_highlight, is_hidden, is_recommended, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: '写真の更新に失敗しました' } },
      { status: 500 },
    );
  }

  const [thumbSigned, displaySigned, originalSigned, reactionRow] = await Promise.all([
    supabaseAdmin.storage.from('wedding-thumbs').createSignedUrl(data.thumb_path, 60 * 60),
    supabaseAdmin.storage.from('wedding-display').createSignedUrl(data.display_path, 60 * 60),
    supabaseAdmin.storage.from('wedding-originals').createSignedUrl(data.original_path, 60 * 60),
    supabaseAdmin
      .from('photo_reaction_counts')
      .select('heart_count, clap_count, wow_count, cry_count, fire_count, total_count')
      .eq('photo_id', data.id)
      .maybeSingle(),
  ]);

  const reactions = {
    heart: reactionRow.data?.heart_count ?? 0,
    clap: reactionRow.data?.clap_count ?? 0,
    wow: reactionRow.data?.wow_count ?? 0,
    cry: reactionRow.data?.cry_count ?? 0,
    fire: reactionRow.data?.fire_count ?? 0,
    total: reactionRow.data?.total_count ?? 0,
  };

  return NextResponse.json({
    success: true,
    data: {
      photo: {
        id: data.id,
        thumbUrl: thumbSigned.data?.signedUrl ?? '',
        displayUrl: displaySigned.data?.signedUrl ?? '',
        originalUrl: originalSigned.data?.signedUrl ?? '',
        guestName: data.guest_name,
        comment: data.comment,
        timelineLabel: data.timeline_label,
        isFavorite: data.is_favorite,
        isHighlight: data.is_highlight,
        isHidden: data.is_hidden,
        isRecommended: data.is_recommended,
        createdAt: data.created_at,
        reactions,
      },
    },
  });
}
