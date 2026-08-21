import { Request, Response } from 'express';
import { CorrectionService } from '../services/correction.service';

export const submitCorrectionRequest = async (req: Request, res: Response) => {
    try {
        const record = await CorrectionService.submitRequest(req.body);
        res.status(201).json({ success: true, data: record });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getPendingRequests = async (req: Request, res: Response) => {
    try {
        const records = await CorrectionService.getPendingRequests();
        res.status(200).json({ success: true, data: records });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resolveCorrectionRequest = async (req: Request, res: Response) => {
    try {
        const { status, teacherNote } = req.body;
        // Use req.user.id as reviewerId
        const reviewerId = (req as any).user.id;
        
        const record = await CorrectionService.resolveRequest(req.params.id, reviewerId, status, teacherNote);
        res.status(200).json({ success: true, data: record });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
