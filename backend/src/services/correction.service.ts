import { prisma } from '../config/database';
import { AttendanceStatus } from '@prisma/client';

export class CorrectionService {
    static async submitRequest(data: any) {
        const { lectureId, studentId, reason, note } = data;

        // Fetch current attendance record
        const record = await prisma.attendanceRecord.findFirst({
            where: { lectureId, studentId }
        });

        if (!record) {
            throw new Error('Attendance record not found');
        }

        if (record.hasCorrectionReq) {
            throw new Error('A correction request is already pending for this record');
        }

        // Update record to indicate a correction request is attached
        await prisma.attendanceRecord.update({
            where: { id: record.id },
            data: { hasCorrectionReq: true }
        });

        return prisma.correctionRequest.create({
            data: {
                studentId,
                lectureId,
                reason,
                note,
                currentStatus: record.status,
                status: 'pending'
            }
        });
    }

    static async getPendingRequests() {
        return prisma.correctionRequest.findMany({
            where: { status: 'pending' },
            include: {
                student: { include: { user: true } },
                lecture: true
            }
        });
    }

    static async resolveRequest(id: string, reviewerId: string, status: string, teacherNote?: string) {
        const request = await prisma.correctionRequest.findUnique({ where: { id } });
        if (!request) {
            throw new Error('Correction request not found');
        }

        if (request.status !== 'pending') {
            throw new Error('Correction request is already resolved');
        }

        // Update request
        const resolvedReq = await prisma.correctionRequest.update({
            where: { id },
            data: {
                status,
                teacherNote,
                reviewedBy: reviewerId,
                reviewedAt: new Date()
            }
        });

        // If approved, update attendance record
        if (status === 'approved') {
            const record = await prisma.attendanceRecord.findFirst({
                where: { lectureId: request.lectureId, studentId: request.studentId }
            });

            if (record) {
                await prisma.attendanceRecord.update({
                    where: { id: record.id },
                    data: {
                        status: AttendanceStatus.PRESENT,
                        correctionStatus: 'approved',
                        teacherNote
                    }
                });
            }
        } else if (status === 'rejected') {
            const record = await prisma.attendanceRecord.findFirst({
                where: { lectureId: request.lectureId, studentId: request.studentId }
            });
            if (record) {
                await prisma.attendanceRecord.update({
                    where: { id: record.id },
                    data: { correctionStatus: 'rejected', teacherNote }
                });
            }
        }

        return resolvedReq;
    }
}
