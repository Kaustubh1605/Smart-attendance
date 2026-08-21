import { prisma } from '../config/database';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceService {
    static async submitAttendance(data: any) {
        const { lectureId, studentId, evidence } = data;

        // 1. Check if lecture exists and is active
        const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
        if (!lecture) {
            throw new Error('Lecture not found');
        }

        // 2. Check if student already marked attendance
        const existing = await prisma.attendanceRecord.findFirst({
            where: { lectureId, studentId }
        });

        if (existing) {
            throw new Error('Attendance already recorded for this lecture');
        }

        // 3. Determine Final Status based on evidence
        let status = AttendanceStatus.PRESENT;
        
        if (evidence.locationStatus === 'mismatch' || !evidence.challengeVerified) {
            status = AttendanceStatus.NEEDS_REVIEW;
        } else if (evidence.locationStatus === 'uncertain' || evidence.deviceStatus !== 'trusted') {
            status = AttendanceStatus.PROBABLE;
        }

        // 4. Save Record
        return prisma.attendanceRecord.create({
            data: {
                lectureId,
                studentId,
                status,
                locationStatus: evidence.locationStatus,
                locationDistance: evidence.locationDistance,
                deviceStatus: evidence.deviceStatus,
                challengeVerified: evidence.challengeVerified,
                challengeLatencyMs: evidence.challengeLatencyMs,
                bleDetected: evidence.bleDetected,
                bleSignalRssi: evidence.bleSignalRssi,
                cctvFaceMatch: evidence.cctvFaceMatch,
                confidenceScore: evidence.confidenceScore,
                evidenceNotes: evidence.evidenceNotes,
            }
        });
    }

    static async getAttendanceByLecture(lectureId: string) {
        return prisma.attendanceRecord.findMany({
            where: { lectureId },
            include: {
                student: { include: { user: true } }
            }
        });
    }

    static async getAttendanceByStudent(studentId: string) {
        return prisma.attendanceRecord.findMany({
            where: { studentId },
            include: {
                lecture: { include: { classroom: true } }
            }
        });
    }

    static async syncOfflineRecords(records: any[]) {
        const savedRecords = [];
        for (const record of records) {
            // Simplified logic for offline sync. 
            // In a real scenario, more complex validation and conflict resolution applies.
            try {
                const saved = await prisma.attendanceRecord.create({
                    data: {
                        lectureId: record.lectureId,
                        studentId: record.studentId,
                        status: AttendanceStatus.PRESENT, // Default mapping
                        evidenceNotes: JSON.stringify(record.factors)
                    }
                });
                savedRecords.push(saved);
            } catch (err) {
                // Ignore duplicates or errors for individual records during sync
            }
        }
        return savedRecords;
    }
}
