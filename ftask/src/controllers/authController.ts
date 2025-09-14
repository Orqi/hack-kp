import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const users = [
    { id: 1, username: 'testuser', password: bcrypt.hashSync('password123', 10) }
];

const JWT_SECRET = 'your_jwt_secret_key';

export const login = (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
};

export const register = (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    const newUser = {
        id: users.length + 1,
        username,
        password: bcrypt.hashSync(password, 10)
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
};

export const logout = (req: Request, res: Response) => {
    // For JWT, logout is typically handled on the client-side by deleting the token.
    // This endpoint can be used for token blocklisting if implemented.
    res.json({ message: 'Logout successful' });
};