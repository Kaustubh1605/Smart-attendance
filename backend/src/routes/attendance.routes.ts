import { Router } from 'express';
import { submitAttendance, getLectureAttendance, getStudentAttendance, syncOfflineAttendance } from '../controllers/attendance.controller';
import { validate } from '../middlewares/validate';
import { submitAttendanceSchema, offlineSyncSchema } from '../validators/attendance.validator';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Student submits attendance
router.post('/submit', authorize(['STUDENT']), validate(submitAttendanceSchema), submitAttendance);

// Teacher syncs offline records
router.post('/sync-offline', authorize(['TEACHER', 'ADMIN']), validate(offlineSyncSchema), syncOfflineAttendance);

// View attendance by lecture
router.get('/lecture/:lectureId', getLectureAttendance);

// View attendance by student
router.get('/student/:studentId', getStudentAttendance);

export default router;
