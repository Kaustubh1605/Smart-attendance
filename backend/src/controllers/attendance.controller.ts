import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';

export const submitAttendance = async (req: Request, res: Response) => {
    try {
        const record = await AttendanceService.submitAttendance(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getLectureAttendance = async (req: Request, res: Response) => {
    try {
        const records = await AttendanceService.getAttendanceByLecture(req.params.lectureId);
        res.status(200).json({ success: true, data: records });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
    try {
        const records = await AttendanceService.getAttendanceByStudent(req.params.studentId);
        res.status(200).json({ success: true, data: records });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const syncOfflineAttendance = async (req: Request, res: Response) => {
    try {
        const records = await AttendanceService.syncOfflineRecords(req.body.records);
        res.status(201).json({ success: true, data: records });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
