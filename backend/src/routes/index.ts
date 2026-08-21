import { Router } from 'express';
import authRoutes from './auth.routes';
import classroomRoutes from './classroom.routes';
import lectureRoutes from './lecture.routes';
import attendanceRoutes from './attendance.routes';
import correctionRoutes from './correction.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/classrooms', classroomRoutes);
router.use('/lectures', lectureRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/corrections', correctionRoutes);

export default router;
