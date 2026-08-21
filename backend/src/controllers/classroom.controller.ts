import { Request, Response } from 'express';
import { ClassroomService } from '../services/classroom.service';

export const createClassroom = async (req: Request, res: Response) => {
    try {
        const classroom = await ClassroomService.create(req.body);
        res.status(201).json({ success: true, data: classroom });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getClassrooms = async (req: Request, res: Response) => {
    try {
        const classrooms = await ClassroomService.getAll();
        res.status(200).json({ success: true, data: classrooms });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getClassroom = async (req: Request, res: Response) => {
    try {
        const classroom = await ClassroomService.getById(req.params.id as string);
        if (!classroom) {
            res.status(404).json({ success: false, message: 'Classroom not found' });
            return;
        }
        res.status(200).json({ success: true, data: classroom });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateClassroom = async (req: Request, res: Response) => {
    try {
        const classroom = await ClassroomService.update(req.params.id as string, req.body);
        res.status(200).json({ success: true, data: classroom });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteClassroom = async (req: Request, res: Response) => {
    try {
        await ClassroomService.delete(req.params.id as string);
        res.status(200).json({ success: true, message: 'Classroom deleted' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
