import { z } from 'zod';

export const reactionTypeValues = ['heart', 'clap', 'wow', 'cry', 'fire'] as const;

export const uploadPhotoSchema = z.object({
  eventCode: z.string().min(3).max(80),
  guestName: z.string().min(1, '名前を入力してください').max(30, '名前は30文字以内です'),
  comment: z.string().max(120, 'コメントは120文字以内です').optional().or(z.literal('')),
  clientUploadId: z.string().min(1),
});

export const patchPhotoSchema = z.object({
  isFavorite: z.boolean().optional(),
  isHighlight: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  timelineLabel: z.string().max(30).optional().nullable(),
});

export const reactionPayloadSchema = z.object({
  reactionType: z.enum(reactionTypeValues),
  guestToken: z.string().min(6).max(120),
});
