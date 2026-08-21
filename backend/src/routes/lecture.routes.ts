import { Router } from 'express';
import { createLecture, getLecturesByDate, getLecture, updateLectureStatus } from '../controllers/lecture.controller';
import { validate } from '../middlewares/validate';
import { createLectureSchema, updateLectureStatusSchema } from '../validators/lecture.validator';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Public (to authenticated users)
router.get('/', getLecturesByDate);
router.get('/:id', getLecture);

// Teacher and Admin
router.put('/:id/status', authorize(['TEACHER', 'ADMIN']), validate(updateLectureStatusSchema), updateLectureStatus);

// Admin only
router.post('/', authorize(['ADMIN']), validate(createLectureSchema), createLecture);

export default router;
