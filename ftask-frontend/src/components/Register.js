import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { useTheme } from '../ThemeContext';

const Register = ({ setToken }) => {
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = 'http://localhost:3000';
    const navigate = useNavigate();
    const { theme } = useTheme();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value.trim();
        const password = e.target.password.value;
        if (!username || !password) {
            setOutput('AUTH_FAIL :: Username and password required.');
            return;
        }
        setIsLoading(true);
        setOutput('Attempting registration...');

        try {
            const registerResponse = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await registerResponse.json();

            if (!registerResponse.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            if (!data.token) {
                throw new Error('No token returned. Please log in manually.');
            }

            setToken(data.token);
            setOutput('Registration successful! Redirecting to Dashboard...');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setOutput(`AUTH_FAIL :: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.async = true;
        script.onload = () => {
            if (window.particlesJS) {
                window.particlesJS('particles-container', {
                    particles: {
                        number: { value: 80, density: { enable: true, value_area: 800 } },
                        color: { value: '#ec1a6d' },
                        shape: { type: 'circle' },
                        opacity: { value: 0.5 },
                        size: { value: 3, random: true },
                        line_linked: { enable: true, distance: 150, color: '#ec1a6d', opacity: 0.4, width: 1 },
                        move: { enable: true, speed: 2, out_mode: 'out' }
                    },
                    interactivity: {
                        detect_on: 'canvas',
                        events: {
                            onhover: { enable: true, mode: 'repulse' },
                            onclick: { enable: true, mode: 'push' },
                            resize: true
                        },
                        modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
                    },
                    retina_detect: true
                });
            }
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
            const pjsCanvas = document.querySelector('.particles-js-canvas-el');
            if (pjsCanvas) pjsCanvas.remove();
        };
    }, []);

    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
            <link
                href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Fira+Code&display=swap"
                rel="stylesheet"
            />
            <div className={`register-body-wrapper ${theme}`}>
                <div id="particles-container"></div>
                <div className="register-container">
                    <div className="register-card">
                        <svg className="police-shield-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <path d="M12 12l4-2-1 4-3 2-3-2-1-4z"></path>
                        </svg>
                        <h2 className="register-title">KERALA POLICE</h2>
                        <p className="register-subtitle">Create your account</p>
                        <form className="register-form" onSubmit={handleFormSubmit}>
                            <input
                                className="register-input"
                                name="username"
                                placeholder="Username"
                                required
                                autoComplete="off"
                                disabled={isLoading}
                            />
                            <input
                                className="register-input"
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                                autoComplete="off"
                                disabled={isLoading}
                            />
                            <button className="register-button" type="submit" disabled={isLoading}>
                                {isLoading ? <div className="loader"></div> : 'Register'}
                            </button>
                        </form>
                        <p className="login-link">
                            Have an account? <span onClick={() => navigate('/login')}>Login here</span>
                        </p>
                    </div>
                    {output && (
                        <pre className={`register-output ${output.startsWith('AUTH_FAIL') ? 'error' : ''}`}>
                            {`[SYSTEM_LOG]:~# ${output}`}
                        </pre>
                    )}
                </div>
            </div>
        </>
    );
};

export default Register;