import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from './logger';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
    adapter,
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
    ],
});

prisma.$on('query', (e) => {
    // Uncomment for verbose query logging
    // logger.debug(`Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
});

export const connectDB = async () => {
    try {
        await prisma.$connect();
        logger.info('Connected to PostgreSQL Database');
    } catch (error) {
        logger.error('Failed to connect to database', error);
        process.exit(1);
    }
};
