import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import routes (to be created)

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import apiRoutes from './routes';

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Smart Attendance API is running.' });
});

app.use('/api/v1', apiRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        code: err.code || 'INTERNAL_ERROR',
        errors: err.errors || []
    });
});

export default app;
