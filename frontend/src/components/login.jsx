import React, { useState } from 'react';
import { setToken } from '../utils/auth.js';
import '../styles/login.css';
import { API_BASE_URL } from '../config.js';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePassword = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setToken(data.access_token);
                window.location.href = '/profile';
            } else {
                const data = await response.json();
                setMessage(`Błąd: ${data.detail || 'Nieznany błąd'}`);
            }
        } catch (error) {
            setMessage(`Błąd: ${error.message}`);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Zaloguj się</h1>
                
                {message && <p className="error-message">{message}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Adres e-mail</label>
                        <input 
                            type="text" 
                            id="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Hasło</label>
                        <div className="password-input">
                            <input 
                                type={passwordVisible ? 'text' : 'password'}
                                id="password" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button 
                                type="button" 
                                className="toggle-password"
                                onClick={togglePassword}
                            >
                                <img 
                                    src="/eye.svg" 
                                    alt="Pokaż/ukryj hasło"
                                    style={{ opacity: passwordVisible ? '1' : '0.7' }}
                                />
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-button">
                        Zaloguj się
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
