import { z } from 'zod';

export const TOPICS = [
  'Politik/Demokratie',
  'Geschichte',
  'Gesellschaft',
  'Recht',
  'Bundesländer',
  'Europa',
  'Wahlen',
  'Alltag',
] as const;

export const SourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  ref: z.string().min(1),
  answerIndex: z.number().int().min(0).max(3),
  answerText: z.string().min(1),
});

/** Optional study help (English). Not official BAMF content. */
export const ExplanationSchema = z.object({
  why: z.string().min(1).optional(),
  trap: z.string().min(1).optional(),
  trick: z.string().min(1).optional(),
});

export const QuestionSchema = z
  .object({
    id: z.string().regex(/^(G([1-9]\d?|[12]\d\d|300)|BB([1-9]|10))$/),
    officialNumber: z.number().int().min(1).max(300),
    catalogNumber: z.number().int().min(1).max(310),
    section: z.enum(['general', 'state']),
    state: z.literal('Brandenburg').optional(),
    topic: z.enum(TOPICS),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    image: z.string().regex(/^\/img\/[A-Z]+\d+\.png$/).optional(),
    imageCredit: z.string().optional(),
    verified: z.boolean(),
    sources: z.array(SourceSchema).min(1),
    pdfPage: z.number().int().positive(),
    note: z.string().optional(),
    explanation: ExplanationSchema.optional(),
  })
  .superRefine((q, ctx) => {
    if (q.verified) {
      const agreeing = q.sources.filter((s) => s.answerIndex === q.answerIndex);
      if (agreeing.length < 2) ctx.addIssue({ code: 'custom', message: `${q.id}: verified needs 2 agreeing sources` });
    }
    if ((q.section === 'state') !== (q.state !== undefined))
      ctx.addIssue({ code: 'custom', message: `${q.id}: state must be set exactly for state questions` });
  });

export const QuestionsFileSchema = z.object({
  meta: z.object({
    title: z.string(),
    catalogVersion: z.string(),
    pdfUrl: z.string().url(),
    state: z.literal('Brandenburg'),
    answerSources: z.array(z.object({ name: z.string(), url: z.string().url(), fetchedAt: z.string() })),
  }),
  questions: z.array(QuestionSchema),
});

export type Explanation = z.infer<typeof ExplanationSchema>;
export type Topic = (typeof TOPICS)[number];
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionsFile = z.infer<typeof QuestionsFileSchema>;
