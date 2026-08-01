import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const REACTION_COLUMN_MAP = {
  heart: 'heart_count',
  clap: 'clap_count',
  wow: 'wow_count',
  cry: 'cry_count',
  fire: 'fire_count',
} as const;

type ReactionKey = keyof typeof REACTION_COLUMN_MAP;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const photoId = String(body?.photoId || '');
  const reaction = String(body?.reaction || '') as ReactionKey;

  if (!photoId || !(reaction in REACTION_COLUMN_MAP)) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'reaction payload invalid' } },
      { status: 400 },
    );
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('photo_reaction_counts')
    .select('photo_id, heart_count, clap_count, wow_count, cry_count, fire_count')
    .eq('photo_id', photoId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'reaction fetch failed' } },
      { status: 500 },
    );
  }

  const next = {
    heart_count: existing?.heart_count ?? 0,
    clap_count: existing?.clap_count ?? 0,
    wow_count: existing?.wow_count ?? 0,
    cry_count: existing?.cry_count ?? 0,
    fire_count: existing?.fire_count ?? 0,
  };
  next[REACTION_COLUMN_MAP[reaction]] += 1;

  const { data, error } = await supabaseAdmin
    .from('photo_reaction_counts')
    .upsert({ photo_id: photoId, ...next }, { onConflict: 'photo_id' })
    .select('photo_id, heart_count, clap_count, wow_count, cry_count, fire_count')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: { code: 'UPSERT_FAILED', message: 'reaction save failed' } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      photoId: data.photo_id,
      reactions: {
        heart: data.heart_count,
        clap: data.clap_count,
        wow: data.wow_count,
        cry: data.cry_count,
        fire: data.fire_count,
      },
    },
  });
}
