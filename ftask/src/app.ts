import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import profileRoutes from './routes/profileRoutes';

const app = express();
const PORT = 3000;


app.use(cors({ origin: 'http://localhost:3001' }));

app.use(bodyParser.json());


app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/profile', profileRoutes);


app.get('/', (req, res) => {
    res.send('Welcome to the API! Use /auth, /dashboard, or /profile.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});