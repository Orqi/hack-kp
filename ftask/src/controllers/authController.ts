import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const users = [
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

    res.json({ token });
};


export const register = (req: Request, res: Response) => {
    const { username, password } = req.body;

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }


    const hashedPassword = bcrypt.hashSync(password, 10);


    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword
    };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
};

export const logout = (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully. Please remove the token from your client.' });
};