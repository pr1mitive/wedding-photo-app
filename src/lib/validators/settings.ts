import { z } from 'zod';

export const displaySettingsSchema = z.object({
  slideIntervalSec: z.number().min(2).max(15),
  focusDurationSec: z.number().min(3).max(10),
  transitionType: z.enum(['fade', 'zoom', 'slide']),
  orderType: z.enum(['chronological', 'newest', 'random']),
  showComment: z.boolean(),
  highlightPriority: z.boolean(),
  albumPublicUntil: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  currentMissionTitle: z.string().max(50).nullable().optional(),
  currentMissionDescription: z.string().max(160).nullable().optional(),
  currentMissionActive: z.boolean().optional(),
  autoHighlightEnabled: z.boolean().optional(),
  autoHighlightIntervalSec: z.number().min(10).max(120).optional(),
});
