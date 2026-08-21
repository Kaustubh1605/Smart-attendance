import { Router } from 'express';
import { submitCorrectionRequest, getPendingRequests, resolveCorrectionRequest } from '../controllers/correction.controller';
import { validate } from '../middlewares/validate';
import { submitCorrectionSchema, resolveCorrectionSchema } from '../validators/correction.validator';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Student creates dispute
router.post('/submit', authorize(['STUDENT']), validate(submitCorrectionSchema), submitCorrectionRequest);

// Teacher/Admin views pending requests
router.get('/pending', authorize(['TEACHER', 'ADMIN']), getPendingRequests);

// Teacher/Admin resolves request
router.put('/:id/resolve', authorize(['TEACHER', 'ADMIN']), validate(resolveCorrectionSchema), resolveCorrectionRequest);

export default router;
