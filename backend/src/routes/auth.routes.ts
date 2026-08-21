import { Router } from 'express';
import { login, register, registerDevice } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/register-device', authenticate, registerDevice);

router.get('/me', authenticate, (req: any, res) => {
    res.status(200).json({ success: true, user: req.user });
});

export default router;
