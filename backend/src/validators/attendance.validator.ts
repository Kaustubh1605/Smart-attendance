import { z } from 'zod';

export const submitAttendanceSchema = z.object({
    body: z.object({
        lectureId: z.string().uuid(),
        studentId: z.string().uuid(),
        evidence: z.object({
            locationStatus: z.enum(['verified', 'mismatch', 'uncertain']).optional(),
            locationDistance: z.number().optional(),
            deviceStatus: z.enum(['trusted', 'unrecognized', 'mismatch']).optional(),
            challengeVerified: z.boolean().optional(),
            challengeLatencyMs: z.number().optional(),
            bleDetected: z.boolean().optional(),
            bleSignalRssi: z.number().optional(),
            cctvFaceMatch: z.enum(['match', 'uncertain', 'unavailable']).optional(),
            confidenceScore: z.number().optional(),
            evidenceNotes: z.string().optional()
        })
    })
});

export const offlineSyncSchema = z.object({
    body: z.object({
        records: z.array(z.object({
            lectureId: z.string().uuid(),
            studentId: z.string().uuid(),
            timestamp: z.string().datetime(),
            status: z.enum(['VERIFIED_PRESENT', 'PROBABLE_PRESENT', 'NEEDS_REVIEW', 'NOT_VERIFIED', 'POSSIBLE_PROXY']).optional(),
            factors: z.any().optional()
        }))
    })
});
