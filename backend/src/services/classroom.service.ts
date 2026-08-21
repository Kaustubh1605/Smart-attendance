import { prisma } from '../config/database';

export class ClassroomService {
    static async create(data: any) {
        return prisma.classroom.create({ data });
    }

    static async getAll() {
        return prisma.classroom.findMany();
    }

    static async getById(id: string) {
        return prisma.classroom.findUnique({ where: { id } });
    }

    static async update(id: string, data: any) {
        return prisma.classroom.update({
            where: { id },
            data
        });
    }

    static async delete(id: string) {
        return prisma.classroom.delete({ where: { id } });
    }
}
