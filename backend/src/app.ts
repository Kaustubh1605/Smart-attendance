import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes (to be created)

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(limiter);

import apiRoutes from './routes';

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Smart Attendance API is running.' });
});

app.use('/api/v1', apiRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    
    if (process.env.NODE_ENV === 'production') {
        res.status(err.status || 500).json({
            success: false,
            message: err.status === 500 || !err.status ? 'Internal Server Error' : err.message,
        });
    } else {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR',
            errors: err.errors || []
        });
    }
});

export default app;
