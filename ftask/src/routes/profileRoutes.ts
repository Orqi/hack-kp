import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, (req, res) => {
    const user = (req as any).user; 
    res.json({
        message: 'Profile fetched successfully',
        profile: {
            id: user.id,
            username: user.username
        }
    });
});

export default router;