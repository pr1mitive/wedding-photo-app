import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createImageVariants } from '@/lib/image/process-image';
import { uploadPhotoSchema } from '@/lib/validators/photo';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const eventCode = String(formData.get('eventCode') || '');
    const guestName = String(formData.get('guestName') || '');
    const comment = String(formData.get('comment') || '');
    const clientUploadId = String(formData.get('clientUploadId') || '');
    const file = formData.get('file');

    const parsed = uploadPhotoSchema.safeParse({ eventCode, guestName, comment, clientUploadId });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: { code: 'FILE_REQUIRED', message: '画像ファイルを選択してください' } }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: { code: 'FILE_TOO_LARGE', message: '画像サイズが大きすぎます' } }, { status: 413 });
    }

    const { data: eventRow, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, is_active')
      .eq('event_code', eventCode)
      .single();

    if (eventError || !eventRow || !eventRow.is_active) {
      return NextResponse.json({ success: false, error: { code: 'EVENT_NOT_FOUND', message: 'イベントが見つかりません' } }, { status: 404 });
    }

    const { data: duplicated } = await supabaseAdmin
      .from('photos')
      .select('id')
      .eq('event_id', eventRow.id)
      .eq('client_upload_id', clientUploadId)
      .maybeSingle();

    if (duplicated) {
      return NextResponse.json({ success: true, data: { photoId: duplicated.id, duplicated: true } });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { original, display, thumb, meta } = await createImageVariants(buffer);

    const photoId = randomUUID();
    const originalPath = `${eventCode}/original/${photoId}.jpg`;
    const displayPath = `${eventCode}/display/${photoId}.jpg`;
    const thumbPath = `${eventCode}/thumb/${photoId}.jpg`;

    const originalUpload = await supabaseAdmin.storage.from('wedding-originals').upload(originalPath, original, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
    if (originalUpload.error) throw originalUpload.error;

    const displayUpload = await supabaseAdmin.storage.from('wedding-display').upload(displayPath, display, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (displayUpload.error) throw displayUpload.error;

    const thumbUpload = await supabaseAdmin.storage.from('wedding-thumbs').upload(thumbPath, thumb, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (thumbUpload.error) throw thumbUpload.error;

    const { error: insertError } = await supabaseAdmin.from('photos').insert({
      id: photoId,
      event_id: eventRow.id,
      guest_name: guestName,
      comment: comment || null,
      original_path: originalPath,
      display_path: displayPath,
      thumb_path: thumbPath,
      mime_type: file.type || 'image/jpeg',
      file_size_bytes: file.size,
      width: meta.width ?? null,
      height: meta.height ?? null,
      upload_status: 'completed',
      client_upload_id: clientUploadId,
    });
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: { photoId, message: 'uploaded' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_FAILED', message: '投稿に失敗しました。通信状況を確認して再送してください' } },
      { status: 500 },
    );
  }
}
