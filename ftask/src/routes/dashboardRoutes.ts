import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();


router.get('/', authenticate, (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${(req as any).user.username}!` });
});

export default router;