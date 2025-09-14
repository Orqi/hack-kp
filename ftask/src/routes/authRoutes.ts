import { Router } from 'express';
// Make sure to import users and authenticate
import { login, register, logout, users } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();


router.post('/login', login);


router.post('/register', register);


router.post('/logout', logout);

// Add this new route here
router.get('/users', authenticate, (req, res) => {
    const safeUsers = users.map((user: { id: number; username: string }) => ({
        id: user.id,
        username: user.username
    }));
    res.json(safeUsers);
});

export default router;