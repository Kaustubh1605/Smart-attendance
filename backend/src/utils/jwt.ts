import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (payload: string | Buffer | object, expiresIn: string = '1d'): string => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};
