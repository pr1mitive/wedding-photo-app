import { z } from 'zod';

export const displaySettingsSchema = z.object({
  slideIntervalSec: z.number().min(2).max(15),
  focusDurationSec: z.number().min(3).max(10),
  transitionType: z.enum(['fade', 'zoom', 'slide']),
  orderType: z.enum(['chronological', 'newest', 'random']),
  showComment: z.boolean(),
  highlightPriority: z.boolean(),
});
