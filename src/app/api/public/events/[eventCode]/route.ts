import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_: Request, { params }: { params: Promise<{ eventCode: string }> }) {
  const { eventCode } = await params;

  const { data, error } = await supabaseAdmin
    .from('events')
    .select('title, event_code, is_active')
    .eq('event_code', eventCode)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'event not found' } }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      eventCode: data.event_code,
      title: data.title,
      isActive: data.is_active,
      acceptingUploads: data.is_active,
    },
  });
}
