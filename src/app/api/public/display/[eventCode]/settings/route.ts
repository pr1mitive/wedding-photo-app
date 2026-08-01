import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_: Request, { params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  const { data: eventRow, error: eventError } = await supabaseAdmin
    .from('events')
    .select('id, title, event_code, album_public_until, is_active')
    .eq('event_code', eventCode)
    .single();

  if (eventError || !eventRow) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'event not found' } }, { status: 404 });
  }

  const { data: settings, error: settingsError } = await supabaseAdmin
    .from('display_settings')
    .select('slide_interval_sec, focus_duration_sec, transition_type, order_type, show_comment, highlight_priority, current_mission_title, current_mission_description, current_mission_active, auto_highlight_enabled, auto_highlight_interval_sec')
    .eq('event_id', eventRow.id)
    .maybeSingle();

  if (settingsError) {
    return NextResponse.json({ success: false, error: { code: 'FETCH_FAILED', message: 'settings fetch failed' } }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: {
      title: eventRow.title,
      eventCode: eventRow.event_code,
      albumPublicUntil: eventRow.album_public_until,
      isActive: eventRow.is_active,
      settings: {
        slideIntervalSec: settings?.slide_interval_sec ?? 5,
        focusDurationSec: settings?.focus_duration_sec ?? 5,
        transitionType: settings?.transition_type ?? 'fade',
        orderType: settings?.order_type ?? 'chronological',
        showComment: settings?.show_comment ?? true,
        highlightPriority: settings?.highlight_priority ?? true,
        currentMissionTitle: settings?.current_mission_title ?? null,
        currentMissionDescription: settings?.current_mission_description ?? null,
        currentMissionActive: settings?.current_mission_active ?? false,
        autoHighlightEnabled: settings?.auto_highlight_enabled ?? false,
        autoHighlightIntervalSec: settings?.auto_highlight_interval_sec ?? 20,
      },
    },
  });
}
