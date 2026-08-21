import { z } from 'zod';

export const submitCorrectionSchema = z.object({
    body: z.object({
        lectureId: z.string().uuid(),
        studentId: z.string().uuid(),
        reason: z.string().min(5),
        note: z.string().optional(),
    })
});

export const resolveCorrectionSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        status: z.enum(['approved', 'rejected']),
        teacherNote: z.string().optional()
    })
});
