import React, { useState, useEffect, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { useTheme } from '../ThemeContext';
import PhotoGallery from './PhotoGallery';

const MemoizedPhotoGallery = memo(PhotoGallery);

const Dashboard = ({ token, setToken }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    const toggleButtonRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        navigate('/login');
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(prev => !prev);
    };

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
            if (pjsCanvas) pjsCanvas.parentElement.remove();
        }
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isDrawerOpen &&
                drawerRef.current &&
                !drawerRef.current.contains(event.target) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target)
            ) {
                setIsDrawerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDrawerOpen]);

    return (
        <>
            <div className={`dashboard-body-wrapper ${theme}`}>
                <div id="particles-container"></div>
                <div className="dashboard-container">
                    <div className="dashboard-card">
                        <div className="title-container">
                            <div className="glitch" data-text="HAC'KP">
                                HAC<span className="kp">'KP</span>
                            </div>
                            <span className="logo-tagline">Automating the Fight Against Online Harm</span>
                        </div>
                        <button className="drawer-toggle" onClick={toggleDrawer} ref={toggleButtonRef}>
                            {isDrawerOpen ? 'Close' : 'Menu'}
                        </button>
                        <MemoizedPhotoGallery />
                    </div>
                </div>
                <div className={`drawer ${isDrawerOpen ? 'open' : ''}`} ref={drawerRef}>
                    <Link to="/profile" className="dashboard-link">
                        Go to Profile
                    </Link>
                    <button className="dashboard-button" onClick={handleLogout}>
                        Logout
                    </button>
                    <button onClick={toggleTheme} className="theme-toggle-button">
                        Toggle Theme
                    </button>
                </div>
            </div>
        </>
    );
};

export default Dashboard;