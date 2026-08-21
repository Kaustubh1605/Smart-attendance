import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const registerDevice = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const result = await AuthService.registerDevice(userId, req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getPendingUsers = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        const result = await AuthService.getPendingUsers();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(403).json({ success: false, message: error.message });
    }
};

export const approveUser = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        const { userId, action } = req.body;
        const result = await AuthService.approveUser(userId, action);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const adminAddUser = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        const result = await AuthService.adminAddUser(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
