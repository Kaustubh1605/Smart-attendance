import { Request, Response } from 'express';
import { LectureService } from '../services/lecture.service';

export const createLecture = async (req: Request, res: Response) => {
    try {
        const lecture = await LectureService.create(req.body);
        res.status(201).json({ success: true, data: lecture });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getLecturesByDate = async (req: Request, res: Response) => {
    try {
        const dateStr = req.query.date as string || new Date().toISOString();
        const lectures = await LectureService.getLecturesByDate(new Date(dateStr));
        res.status(200).json({ success: true, data: lectures });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getLecture = async (req: Request, res: Response) => {
    try {
        const lecture = await LectureService.getById(req.params.id);
        if (!lecture) {
            res.status(404).json({ success: false, message: 'Lecture not found' });
            return;
        }
        res.status(200).json({ success: true, data: lecture });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateLectureStatus = async (req: Request, res: Response) => {
    try {
        // Must be teacher assigned to the lecture or admin
        const lecture = await LectureService.updateStatus(req.params.id, req.body.status);
        res.status(200).json({ success: true, data: lecture });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
