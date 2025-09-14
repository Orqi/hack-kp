import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

const Profile = ({ token }) => {
    const [output, setOutput] = useState('');
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/profile`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                setOutput(JSON.stringify(data, null, 2));
            } catch (error) {
                setOutput('Error occurred while fetching the profile.');
            }
        };

        fetchProfile();
    }, [token]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.async = true;
        script.onload = () => {
            if (window.particlesJS) {
                window.particlesJS("particles-container", {
                    "particles": {
                        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                        "color": { "value": "#ec1a6d" },
                        "shape": { "type": "circle" },
                        "opacity": { "value": 0.5, "random": false, "anim": { "enable": false } },
                        "size": { "value": 3, "random": true, "anim": { "enable": false } },
                        "line_linked": { "enable": true, "distance": 150, "color": "#ec1a6d", "opacity": 0.4, "width": 1 },
                        "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
                    },
                    "interactivity": {
                        "detect_on": "canvas",
                        "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                        "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } }
                    },
                    "retina_detect": true
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            const pjsCanvas = document.querySelector('.particles-js-canvas-el');
            if (pjsCanvas) pjsCanvas.remove();
        }
    }, []);

    return (
        <>
            <div className={`profile-body-wrapper ${theme}`}>
                <div id="particles-container"></div>
                <div className="profile-container">
                    <div className="profile-card">
                        <button className="back-button" onClick={() => navigate('/dashboard')}>← Back</button>
                        <h2 className="profile-title">Profile</h2>
                        <p className="profile-subtitle">User Information</p>
                        <pre className="profile-output">
                            {output}
                        </pre>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;