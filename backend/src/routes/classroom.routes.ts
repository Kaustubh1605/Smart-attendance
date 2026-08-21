import { Router } from 'express';
import { createClassroom, getClassrooms, getClassroom, updateClassroom, deleteClassroom } from '../controllers/classroom.controller';
import { validate } from '../middlewares/validate';
import { createClassroomSchema, updateClassroomSchema } from '../validators/classroom.validator';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Only ADMIN can manage classrooms
router.use(authenticate, authorize(['ADMIN']));

router.post('/', validate(createClassroomSchema), createClassroom);
router.get('/', getClassrooms);
router.get('/:id', getClassroom);
router.put('/:id', validate(updateClassroomSchema), updateClassroom);
router.delete('/:id', deleteClassroom);

export default router;
