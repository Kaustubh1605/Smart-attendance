import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export class AuthService {
    static async register(data: any) {
        const { email, password, name, role } = data;
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                role: role as Role
            }
        });

        // Optionally, create profile based on role here...

        const token = generateToken({ id: user.id, role: user.role });
        
        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
        };
    }

    static async login(data: any) {
        const { email, password } = data;
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        const token = generateToken({ id: user.id, role: user.role });
        
        return {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token
        };
    }

    static async registerDevice(userId: string, data: any) {
        const { deviceId, deviceName, deviceModel, deviceFingerprintHash } = data;
        
        const profile = await prisma.studentProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            throw new Error('Student profile not found. Only students can register devices.');
        }

        if (deviceId) {
            const existingDevice = await prisma.studentProfile.findUnique({
                where: { deviceId }
            });
            if (existingDevice && existingDevice.id !== profile.id) {
                throw new Error('This device is already registered to another user.');
            }
        }

        const updatedProfile = await prisma.studentProfile.update({
            where: { id: profile.id },
            data: {
                deviceId,
                deviceName,
                deviceModel,
                deviceFingerprintHash,
                isDeviceTrusted: true,
                deviceRegisteredAt: new Date()
            }
        });

        return {
            success: true,
            deviceId: updatedProfile.deviceId,
            isDeviceTrusted: updatedProfile.isDeviceTrusted,
            deviceRegisteredAt: updatedProfile.deviceRegisteredAt
        };
    }
}
