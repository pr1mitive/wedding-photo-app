import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { reactionPayloadSchema, reactionTypeValues } from '@/lib/validators/photo';

const createEmptyCounts = () => ({ heart: 0, clap: 0, wow: 0, cry: 0, fire: 0, total: 0 });

export async function POST(req: NextRequest, { params }: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = reactionPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'invalid payload' } },
      { status: 400 },
    );
  }

  const { data: photo, error: photoError } = await supabaseAdmin
    .from('photos')
    .select('id, is_hidden')
    .eq('id', photoId)
    .single();

  if (photoError || !photo || photo.is_hidden) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'photo not found' } }, { status: 404 });
  }

  const existing = await supabaseAdmin
    .from('photo_reactions')
    .select('id')
    .eq('photo_id', photoId)
    .eq('guest_token', parsed.data.guestToken)
    .eq('reaction_type', parsed.data.reactionType)
    .maybeSingle();

  let active = true;

  if (existing.data?.id) {
    active = false;
    const { error } = await supabaseAdmin.from('photo_reactions').delete().eq('id', existing.data.id);
    if (error) {
      return NextResponse.json({ success: false, error: { code: 'TOGGLE_FAILED', message: 'reaction delete failed' } }, { status: 500 });
    }
  } else {
    const { error } = await supabaseAdmin.from('photo_reactions').insert({
      photo_id: photoId,
      guest_token: parsed.data.guestToken,
      reaction_type: parsed.data.reactionType,
    });
    if (error) {
      return NextResponse.json({ success: false, error: { code: 'TOGGLE_FAILED', message: 'reaction insert failed' } }, { status: 500 });
    }
  }

  const { data: allRows, error: allError } = await supabaseAdmin
    .from('photo_reactions')
    .select('reaction_type')
    .eq('photo_id', photoId);

  if (allError) {
    return NextResponse.json({ success: false, error: { code: 'COUNT_FAILED', message: 'reaction count failed' } }, { status: 500 });
  }

  const reactions = createEmptyCounts();
  for (const type of reactionTypeValues) {
    reactions[type] = 0;
  }
  for (const row of allRows || []) {
    reactions[row.reaction_type as keyof typeof reactions] += 1;
    reactions.total += 1;
  }

  return NextResponse.json({ success: true, data: { active, reactions } });
}
