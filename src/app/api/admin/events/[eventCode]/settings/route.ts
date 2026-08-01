import { NextRequest, NextResponse } from 'next/server';
import { assertAdminApiAccess } from '@/lib/auth/assert-admin-api-access';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { displaySettingsSchema } from '@/lib/validators/settings';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  const access = await assertAdminApiAccess(eventCode);
  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status });
  }

  const body = await req.json().catch(() => null);
  const parsed = displaySettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'invalid payload' } },
      { status: 400 },
    );
  }

  const settingsPayload = {
    slide_interval_sec: parsed.data.slideIntervalSec,
    focus_duration_sec: parsed.data.focusDurationSec,
    transition_type: parsed.data.transitionType,
    order_type: parsed.data.orderType,
    show_comment: parsed.data.showComment,
    highlight_priority: parsed.data.highlightPriority,
  };

  const { error: settingsError } = await supabaseAdmin
    .from('display_settings')
    .upsert({ event_id: access.eventId, ...settingsPayload }, { onConflict: 'event_id' });

  if (settingsError) {
    return NextResponse.json(
      { success: false, error: { code: 'SETTINGS_UPDATE_FAILED', message: '表示設定の保存に失敗しました' } },
      { status: 500 },
    );
  }

  const eventPayload: { album_public_until?: string | null; is_active?: boolean } = {};
  if (parsed.data.albumPublicUntil !== undefined) eventPayload.album_public_until = parsed.data.albumPublicUntil;
  if (parsed.data.isActive !== undefined) eventPayload.is_active = parsed.data.isActive;

  if (Object.keys(eventPayload).length) {
    const { error: eventError } = await supabaseAdmin.from('events').update(eventPayload).eq('id', access.eventId);
    if (eventError) {
      return NextResponse.json(
        { success: false, error: { code: 'EVENT_UPDATE_FAILED', message: 'イベント設定の保存に失敗しました' } },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: { saved: true } });
}
