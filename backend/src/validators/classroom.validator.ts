import { z } from 'zod';

export const createClassroomSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        building: z.string().min(2),
        roomNumber: z.string().min(1),
        capacity: z.number().positive(),
        lat: z.number(),
        lng: z.number(),
        radiusMeters: z.number().positive(),
        geofenceStatus: z.enum(['active', 'inactive']).default('active'),
        bleBeaconId: z.string().optional(),
        bleStatus: z.enum(['active', 'offline']).default('active'),
        localNetworkSsid: z.string().optional(),
        localNetworkStatus: z.string().optional(),
        offlineEnabled: z.boolean().default(false)
    })
});

export const updateClassroomSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        name: z.string().min(2).optional(),
        building: z.string().min(2).optional(),
        roomNumber: z.string().min(1).optional(),
        capacity: z.number().positive().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        radiusMeters: z.number().positive().optional(),
        geofenceStatus: z.enum(['active', 'inactive']).optional(),
        bleBeaconId: z.string().optional(),
        bleStatus: z.enum(['active', 'offline']).optional(),
        localNetworkSsid: z.string().optional(),
        localNetworkStatus: z.string().optional(),
        offlineEnabled: z.boolean().optional()
    })
});
