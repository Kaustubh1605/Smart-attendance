import { prisma } from '../config/database';

export class LectureService {
    static async create(data: any) {
        return prisma.lecture.create({ data });
    }

    static async getLecturesByDate(date: Date) {
        // Find lectures happening on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return prisma.lecture.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                classroom: true,
                teacher: {
                    include: { user: true }
                }
            }
        });
    }

    static async getById(id: string) {
        return prisma.lecture.findUnique({
            where: { id },
            include: {
                classroom: true,
                teacher: {
                    include: { user: true }
                }
            }
        });
    }

    static async updateStatus(id: string, status: string) {
        let activeSessionId = null;
        if (status === 'active') {
            activeSessionId = `sess-${id}-${Date.now()}`;
        }
        
        return prisma.lecture.update({
            where: { id },
            data: { 
                status, 
                activeSessionId 
            }
        });
    }
}
