import { z } from 'zod';

export const createLectureSchema = z.object({
    body: z.object({
        code: z.string().min(2),
        name: z.string().min(2),
        className: z.string().optional(),
        date: z.string().datetime(),
        startTime: z.string().min(4),
        endTime: z.string().min(4),
        duration: z.string().optional(),
        teacherId: z.string().uuid(),
        classroomId: z.string().uuid()
    })
});

export const updateLectureStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        status: z.enum(['upcoming', 'active', 'completed'])
    })
});
