import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import './App.css';
import { ThemeProvider } from './ThemeContext';

const App = () => {
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('token');
        return storedToken || '';
    });

    useEffect(() => {
        localStorage.setItem('token', token);
    }, [token]);

    return (
        <ThemeProvider> {}
            <Router>
                <div className="app-container">
                    <Routes>
                        <Route path="/register" element={<Register setToken={setToken} />} />
                        <Route path="/login" element={<Login setToken={setToken} />} />
                        <Route path="/dashboard" element={<Dashboard token={token} setToken={setToken} />} />
                        <Route path="/profile" element={<Profile token={token} />} />
                        {}
                        <Route path="/" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
};

export default App;